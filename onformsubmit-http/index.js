/**
 * Handles Google Form submission answers
 */
const google = require("googleapis");
const axios = require("axios").default;

// default consts
// make changes as needed
const SERVICE_ACCOUNT_KEY = "./creds.json";
const FIRECLOUD_URL = "https://api.firecloud.org";
const ADMIN_EMAILS = [
  "vreeves@broadinstitute.org",
  "candace@broadinstitute.org",
  "ltran@asymmetrik.com",
];

exports.onFormSubmit = async (req, res) => {
  const message = req.body;

  // parse creds file
  let serviceAccountEmail;
  try {
    const creds = require(SERVICE_ACCOUNT_KEY);
    serviceAccountEmail = creds.client_email;
  } catch (err) {
    console.error(`[Error] Could not read creds file: ${err}`);
    return res.status(500).send(`[500] Could not read creds file: {err}`);
  }

  // extract data from submission message
  let submissionTime, email, editLink, questions, responses;
  try {
    submissionTime = message.submissionTime;
    email = message.email;
    editLink = message.editLink;
    questions = JSON.parse(message.questions);
    responses = JSON.parse(message.responses);
  } catch (err) {
    console.error(`[Error] Submission data malformed: ${err}`);
    return res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // log data received
  console.info("--Data Received--");
  console.info(`${submissionTime}: ${email}`);
  console.info(`  ${editLink}`);
  // TODO: remove question type?
  const questionAndAnswerList = [];
  for (let i = 0; i < questions.length; i++) {
    const qna = `${questions[i]}: ${responses[i]}`;
    questionAndAnswerList.push(qna);
    console.info(qna);
  }

  // TODO: fill this out some more
  // extract neccessary data from submission message
  const billingProject = "anvil-dev-fhir2";
  const workspaceName = "hammer_test_space";
  const groupName = "AUTH_Asym_Test";
  const submitterEmail = email;

  // setup auth
  try {
    const bearerToken = await getOAuth2Token();
    // TODO: remove this client
    // console.log(bearerToken);
    axios.defaults.baseURL = FIRECLOUD_URL;
    axios.defaults.headers.common["Authorization"] = `Bearer ${bearerToken}`;
  } catch (err) {
    console.error(`[Error] Could not authorize credentials: ${err}`);
    return res.status(401).send(`[401] Unauthorized: ${err}`);
  }

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

    // add admin emails
    ADMIN_EMAILS.forEach(async (email) => {
      console.info(`[LOG] Adding ${email} to group ${groupName}`);
      await axios.put(`/api/groups/${groupName}/admin/${email}`);
    });

    // add submitter email
    console.info(`[LOG] Adding ${submitterEmail} to group ${groupName}`);
    await axios.put(`/api/groups/${groupName}/admin/${submitterEmail}`);

    // add service account email
    console.info(`[LOG] Adding ${serviceAccountEmail} to group ${groupName}`);
    await axios.put(`/api/groups/${groupName}/admin/${serviceAccountEmail}`);
  } catch (err) {
    console.error(`[Error] /api/groups call: ${err}`);
    return res.status(400).send(`[400] Bad Request: ${err}`);
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
 * Retrieves the access token for Firecloud API calls
 */
const getOAuth2Token = async () => {
  // auth params
  const oAuth2Scopes = [
    // "openid",
    "email",
    "profile",
    // "https://www.googleapis.com/auth/cloud-billing",
  ];

  // get access token
  try {
    const googleAuthClient = new google.Auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: oAuth2Scopes,
    });

    return await googleAuthClient.getAccessToken();
  } catch (err) {
    throw new Error(err);
  }
};
