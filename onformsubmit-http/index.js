/**
 * Handles Google Form submission answers
 */
const axios = require("axios").default;

const Auth = require("./utils/auth");
const Submission = require("./utils/submission");

// default consts
// make changes as needed
const SERVICE_ACCOUNT_KEY = "creds.json";
// const FIRECLOUD_URL = "https://api.firecloud.org";
const FIRECLOUD_URL =
  "https://firecloud-orchestration.dsde-dev.broadinstitute.org/";
const ADMIN_EMAILS = [
  "vreeves@broadinstitute.org",
  "candace@broadinstitute.org",
  "ltran@asymmetrik.com",
];

exports.onFormSubmit = async (req, res) => {
  const message = req.body;

  // initialize axios with token
  let auth, serviceAccountEmail;
  try {
    auth = new Auth(SERVICE_ACCOUNT_KEY);
    serviceAccountEmail = auth.clientEmail();

    const bearerToken = await auth.requestAccessToken();
    axios.defaults.baseURL = FIRECLOUD_URL;
    axios.defaults.headers.common["Authorization"] = `Bearer ${bearerToken}`;
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

  // TODO: fill this out some more
  // extract neccessary data from submission message
  const billingProject = "anvil-dev-fhir2";
  const workspaceName = "hammer_test_space";
  const groupName = "AUTH_Hammer";
  const submitterEmail = submission.email();

  // create and add submitter + anvil-admins to auth domain
  // POST /api/groups/${groupName}
  // PUT /api/groups/${groupName}/${role}/${email}
  let groupEmail;
  try {
    // create new group
    console.info(`[LOG] Creating group ${groupName}`);
    await axios.post(`/api/groups/${groupName}`).then((res) => {
      groupEmail = res.data.groupEmail;
    });

    // add necessary users to group
    const authEmails = [submitterEmail, serviceAccountEmail, ...ADMIN_EMAILS];
    addToAuthDomain(authEmails, groupName);
  } catch (err) {
    console.error(`[400] Failed to create group: ${err}`);
    return res.status(400).send(`[Bad Request] ${err}`);
  }

  // create and share workspace
  // POST /api/workspaces
  // PATCH /api/workspaces/${workspaceNamespace}/${workspaceName}/acl
  try {
    // create workspace request
    const workspaceRequest = {
      namespace: billingProject,
      name: workspaceName,
      authorizationDomain: [
        {
          membersGroupName: groupName,
        },
      ],
      attributes: {},
      noWorkspaceOwner: false,
    };
    await axios.post("/api/workspaces", workspaceRequest).then((res) => {
      console.log(res.data);
    });

    // create share request
    const aclRequest = [
      {
        email: groupEmail,
        accessLevel: "OWNER",
        canShare: true,
        canCompute: true,
      },
    ];
    await axios
      .patch(
        "/api/workspaces/anvil-dev-fhir2/hammer_test_space/acl",
        aclRequest
      )
      .then((res) => {
        console.log(res.data);
      });
  } catch (err) {
    console.error(err);
    console.error(`[Error] Failed to create workspace: ${err}`);
    return res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // TODO: remove service account from workspace/auth domain
  try {
    // const credsFile = require(SERVICE_ACCOUNT_KEY);
    // console.info(
    //   `[LOG] Removing ${credsFile.client_email} from group ${groupName}`
    // );
    // await axios.delete(
    //   `/api/groups/${groupName}/admin/${credsFile.client_email}`
    // );
  } catch (err) {
    console.error(
      `[Error] Failed to remove ${serviceAccountEmail} from workspace: ${err}`
    );
    return res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // TODO: Replace with meaningful message
  const msg = "Completed Run!";
  console.log(`[Success] ${msg}`);
  return res.status(200).send(`[200] OK: ${msg}`);
};

/**
 * Adds accounts to auth domain
 */
const addToAuthDomain = async (emails, groupName) => {
  try {
    emails.forEach(async (email) => {
      console.info(`[LOG] Adding ${email} to group ${groupName}`);
      await axios.put(`/api/groups/${groupName}/admin/${email}`);
    });
  } catch (err) {
    console.error(`[Error] Failed to POST email to auth domain: ${err}`);
    return res.status(400).send(`[400] Bad Request: ${err}`);
  }
};
