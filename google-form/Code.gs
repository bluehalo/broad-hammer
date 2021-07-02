/**
 * Sends all submission data over to a Cloud Function to be processed
 */
const URL =
  "https://us-east4-gcp-testing-308520.cloudfunctions.net/onFormSubmit";

function onSubmit(event) {
  // The event is a FormResponse object:
  // https://developers.google.com/apps-script/reference/forms/form-response
  const formResponse = event.response;
  const submissionTime = formResponse.getTimestamp();
  const respondentEmail = formResponse.getRespondentEmail();
  const editResponseUrl = formResponse.getEditResponseUrl();
  const itemResponses = formResponse.getItemResponses();

  // Gets the questions from the responses
  // https://developers.google.com/apps-script/reference/forms/item
  const questions = itemResponses.map((e) => {
    return e.getItem().getTitle();
  });

  // Gets the actual response strings from the array of ItemResponses
  // https://developers.google.com/apps-script/reference/forms/item-response
  const responses = itemResponses.map((e) => {
    return e.getResponse();
  });

  // Log answers to console
  console.log(`${submissionTime}: ${respondentEmail}`);
  console.log(`   ${editResponseUrl}`);
  for (let i = 0; i < questions.length; i++) {
    console.log(`${questions[i]}: ${responses[i]}`);
  }

  // Create auth token
  const headers = {
    Authorization: `Bearer ${ScriptApp.getIdentityToken()}`,
  };

  // Create payload with submission data
  const payload = {
    submissionTime: submissionTime,
    email: respondentEmail,
    editLink: editResponseUrl,
    questions: JSON.stringify(questions),
    responses: JSON.stringify(responses),
  };

  // Post the payload as JSON to our Cloud Function
  UrlFetchApp.fetch(URL, {
    headers: headers,
    method: "post",
    payload: payload,
  });
}
