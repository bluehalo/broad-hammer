/**
 * Handles Google Form submission answers
 */
const { Firestore } = require("@google-cloud/firestore");
const google = require("googleapis");
const axios = require("axios");

// default consts
const FIRECLOUD_URL = "https://api.firecloud.org";
const FIRESTORE_COLLECTION = "submission-answers";

exports.onFormSubmit = async (req, res) => {
  const message = req.body;

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
    console.log(qna);
  }

  // setup auth
  try {
    const bearerToken = await getOAuth2Token();
    axios.defaults.baseURL = FIRECLOUD_URL;
    axios.defaults.headers.common["Authorization"] = `Bearer ${bearerToken}`;
  } catch (err) {
    console.error(`[Error] Could not authorize credentials: ${err}`);
    return res.status(401).send(`[401] Unauthorized: ${err}`);
  }

  // TODO: create workspace
  // POST /api/workspaces
  try {
    await axios.get("/api/workspaces").then((res) => {
      console.log(res);
    });
  } catch (err) {
    console.error(`[Error] /api/workspaces/ call: ${err}`);
    return res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // TODO: log data data into firestore
  //        this will require us to have created a workspace first
  //        to have a collectionName to log the data
  /**
  try {
    const firestore = new Firestore();
    const collection = firestore.collection(FIRESTORE_COLLECTION);

    // create document payload
    const payload = {
      submissionTime,
      submitterEmail: email,
      editLink,
      questions,
      responses,
      questionAndAnswerList,
    };

    // create document
    // TODO: replace with workspace name
    const document = await collection
      .doc("DEFAULT_WORKSPACE")
      .set(message, { merge: true });
    console.log(
      `${document.writeTime.toDate()}: Document written to ${FIRESTORE_COLLECTION}`
    );
  } catch (err) {
    console.error(`[Error] Firestore: ${err}`);
    res.status(400).send(`[400] Bad Request: ${err}`);
  }
  **/

  // TODO: add auth domain
  // POST /api/groups/${groupName}

  // TODO: add submitter + anvil-admins to auth domain
  // PUT /api/groups/${groupName}/${role}/${email}

  // TODO: remove service account from workspace/auth domain

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
  const serviceAccountKey = "./creds.json";
  const oAuth2Scopes = [
    // "openid",
    "email",
    "profile",
    // "https://www.googleapis.com/auth/cloud-billing",
  ];

  try {
    const googleAuthClient = new google.Auth.GoogleAuth({
      keyFile: serviceAccountKey,
      scopes: oAuth2Scopes,
    });

    return await googleAuthClient.getAccessToken();
  } catch (err) {
    throw new Error(err);
  }
};
