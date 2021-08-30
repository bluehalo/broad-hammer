# Google Form

> Intake form for the submitter to create a workspace

## Getting Started

Google Forms have a Script Editor where you need to inject the code from the `google-form`.
The code is in `gs` format, which is loosely based on JavaScript.
The service account will be automatically created [`appsdev-apps-dev-script-auth@system.gserviceaccount.com`](https://developers.google.com/apps-script/guides/cloud-platform-projects#default_cloud_platform_projects) and used for deployment.
Complete this setup on the account that you want error messages to report to.

**NOTE: Create the Cloud Function in GCP to get the HTTP URL before proceeding**

1. Link the GCP project to send the form answers to in the settings section
   - In general settings, check the 'Show "appscript.json" manifest file in editor'
2. Add the code from the `google-form` folder into the files section of the Editor
   - Change the `URL` variable to the HTTP trigger for the Cloud Function
3. In the Triggers tab, add a Trigger with the following settings

   - "Choose which function to run": `onSubmit`
   - "Choose which deployment should run": `Head`
   - "Select event source": `From form`
   - "Select event type": `On form submit`

## Implementation Notes

- Responses are parsed based on the question name
  You may add descriptions to assist the users, but changes to the questions will require code refactoring
- Due to size limitations, submissions with more than 8 cohorts will require manual review
- After workspace creation, data wrangler should clone the workspace and manually review the information
- The form requires submitters to have access to the GCP project through IAM roles or they will not be able to create workspaces
