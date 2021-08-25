/**
 * Handles Google Form submission answers
 */
const axios = require("axios").default;
const logger = require("./utils/logger");

const Auth = require("./utils/auth");
const Submission = require("./utils/submission");
const Firecloud = require("./utils/firecloud");
const Cohort = require("./utils/cohort");

// pull env vars
const SERVICE_ACCOUNT_KEY = process.env.SERVICE_ACCOUNT_KEY;
const FIRECLOUD_URL = process.env.FIRECLOUD_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const BILLING_PROJECT = process.env.DEFAULT_BILLING_PROJECT;

const processCohort = async (cohort, firecloud, emails) => {
  try {
    const workspaceName = cohort.workspaceName;
    const authDomain = cohort.authDomain;
    const attributes = cohort.attributes;

    // create auth domain for workspace
    await firecloud.createGroup(authDomain);

    // add users to auth domain
    await firecloud.addUserToGroup(authDomain, ADMIN_EMAIL, "admin");
    for (let email in emails) {
      await firecloud.addUserToGroup(authDomain, email, "member");
    }

    // clone workspace from template
    await firecloud.cloneWorkspace(workspaceName, authDomain, attributes);

    // add admin and auth domain to group
    await firecloud.addUserToWorkspace(
      workspaceName,
      BILLING_PROJECT,
      ADMIN_EMAIL,
      "OWNER"
    );
  } catch (e) {
    logger.error("INDEX >>> processCohort");
    throw new Error(e);
  }
};

exports.onFormSubmit = async (req, res) => {
  const message = req.body;

  // initialize http client
  const httpClient = axios.create({
    baseURL: FIRECLOUD_URL,
  });

  // initialize auth with token
  let auth;
  try {
    auth = new Auth(SERVICE_ACCOUNT_KEY);

    const bearerToken = await auth.requestAccessToken();
    httpClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${bearerToken}`;
  } catch (e) {
    logger.error(`[500] Failed to initialize Auth: ${e}`);
    return res.status(500).send(`[Internal Server Error] ${e}`);
  }

  // extract data from submission message
  let submission,
    sequencingCenter,
    contactName,
    contactEmail,
    dataModel,
    cohortMap;
  try {
    submission = new Submission(message);
    sequencingCenter = submission.sequencingCenter;
    contactName = submission.contactName;
    contactEmail = submission.email;
    dataModel = submission.dataModel;
    cohortMap = submission.cohortMap;
  } catch (e) {
    logger.error(`[400] Failed to parse submission message: ${e}`);
    return res.status(400).send(`[Bad Request] ${e}`);
  }

  // create cohort objects to be processed
  const cohorts = [];
  try {
    cohortMap.forEach((cohortData) => {
      const cohort = new Cohort(
        sequencingCenter,
        contactName,
        contactEmail,
        dataModel,
        cohortData
      );

      cohorts.push(cohort);
    });
  } catch (e) {
    logger.error(`[400] Failed to parse cohort map: ${e}`);
    return res.status(400).send(`[Bad Request] ${e}`);
  }

  // parse email submissions
  const emails = [];
  emails.push(contactEmail);

  // pass each cohort to firecloud to be processed
  const firecloud = new Firecloud(httpClient);
  try {
    for (const cohort of cohorts) {
      await processCohort(cohort, firecloud, emails);
    }
  } catch (e) {
    logger.error(`[500] Failed to process cohorts: ${e}`);
    return res.status(500).send(`[Internal Server Error] ${e}`);
  }

  // TODO: Replace with meaningful message
  const msg = "Completed Run!";
  logger.log(`[Success] ${msg}`);
  return res.status(200).send(`[200] OK: ${msg}`);
};
