/**
 * Handles Google Form submission answers
 */
const axios = require("axios").default;

const Auth = require("./utils/auth");
const Submission = require("./utils/submission");
const Firecloud = require("./utils/firecloud");

// pull env vars
const FIRECLOUD_URL = process.env.FIRECLOUD_URL;
const SERVICE_ACCOUNT_KEY = process.env.SERVICE_ACCOUNT_KEY;
const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(",");

exports.onFormSubmit = async (req, res) => {
  const message = req.body;

  // initialize http client
  const httpClient = axios.create({
    baseURL: FIRECLOUD_URL,
  });

  // initialize auth with token
  let auth, serviceAccountEmail;
  try {
    auth = new Auth(SERVICE_ACCOUNT_KEY);
    serviceAccountEmail = auth.clientEmail();

    const bearerToken = await auth.requestAccessToken();
    httpClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${bearerToken}`;
  } catch (e) {
    console.error(`[500] Failed to initialize Auth: ${e}`);
    return res.status(500).send(`[Internal Server Error] ${e}`);
  }

  // extract data from submission message
  let submission;
  try {
    submission = new Submission(message);
  } catch (e) {
    console.error(`[400] Failed to parse submission message: ${e}`);
    return res.status(400).send(`[Bad Request] ${e}`);
  }

  // extract neccessary data from submission message
  const groupName = submission.groupName();
  const billingProject = submission.billingProject();
  const workspaceName = submission.workspaceName();
  const submitterEmail = submission.email();

  // creates firecloud client
  const firecloud = new Firecloud(httpClient);

  // creates group and adds submitter + anvil-admins to group
  // POST /api/groups/${groupName}
  // PUT /api/groups/${groupName}/${role}/${email}
  try {
    // create group
    await firecloud.createGroup(groupName);
    await firecloud.addUserToGroup(groupName, serviceAccountEmail, "admin");

    // add anvil-admins to group
    ADMIN_EMAILS.forEach(async (email) => {
      await firecloud.addUserToGroup(groupName, email, "admin");
    });

    // submitter will need to be manually added as admin
    await firecloud.addUserToGroup(groupName, submitterEmail);
  } catch (e) {
    console.error(`[400] Failed to create group: ${e}`);
    return res.status(400).send(`[Bad Request] ${e}`);
  }

  // create and share workspace
  // POST /api/workspaces
  // PATCH /api/workspaces/${workspaceNamespace}/${workspaceName}/acl
  try {
    await firecloud.createWorkspace(workspaceName, billingProject, groupName);
    await firecloud.shareWorkspace(
      workspaceName,
      billingProject,
      serviceAccountEmail,
      "OWNER"
    );

    // add anvil-admins to group
    ADMIN_EMAILS.forEach(async (email) => {
      await firecloud.addUserToWorkspace(
        workspaceName,
        billingProject,
        email,
        "OWNER"
      );
    });

    // add submitter as read-only
    await firecloud.addUserToWorkspace(
      workspaceName,
      billingProject,
      submitterEmail,
      "READER"
    );
  } catch (err) {
    console.error(err);
    console.error(`[400] Failed to create workspace: ${err}`);
    return res.status(400).send(`[Bad Request] ${err}`);
  }

  // TODO: remove service account from auth domain
  // user must manually remove service account from workspace
  try {
    // remove from auth domain
    await firecloud.removeUserFromGroup(
      groupName,
      serviceAccountEmail,
      "admin"
    );

    // remove from workspace
    await firecloud.removeUserFromWorkspace(
      workspaceName,
      billingProject,
      serviceAccountEmail
    );
  } catch (err) {
    console.error(
      `[400] Failed to remove ${serviceAccountEmail} from workspace: ${err}`
    );
    return res.status(400).send(`[Bad Request] ${err}`);
  }

  // TODO: Replace with meaningful message
  const msg = "Completed Run!";
  console.log(`[Success] ${msg}`);
  return res.status(200).send(`[200] OK: ${msg}`);
};
