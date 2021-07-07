/**
 * Handles Google Form submission answers
 */
const { PubSub } = require("@google-cloud/pubsub");
const { FireStore, Firestore } = require("@google-cloud/firestore");

// axios
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
    res.status(400).send(`[400] Bad Request: ${err}`);
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

  // setup axios
  axios.defaults.baseURL = "https://api.firecloud.org";
  // TODO: setup auth
  axios.defaults.headers.common["Authorization"] = "TODO";

  // TODO: create workspace
  // TODO: figure out auth
  try {
    axios.get("/api/workspaces").then((res) => {
      console.log(res);
    });
  } catch (err) {
    console.error(`[Error] /api/workspaces/ call: ${err}`);
    res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // TODO: log data data into firestore
  //        this will require us to have created a workspace first
  //        to have a collectionName to log the data
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
      .doc("WORKSPACE_NAME")
      .set(message, { merge: true });
    console.log(
      `${document.writeTime.toDate()}: Document written to ${FIRESTORE_COLLECTION}`
    );
  } catch (err) {
    console.error(`[Error] Firestore: ${err}`);
    res.status(400).send(`[400] Bad Request: ${err}`);
  }

  // TODO: Replace with meaningful message
  const msg = "Completed Run!";
  console.log(`[Success] ${msg}`);
  res.status(200).send(`[200] OK: ${msg}`);
};
