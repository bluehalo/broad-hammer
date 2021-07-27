# AnVIL Data Ingestion

> Automation for AnVIL data submitters to self service their code before manual review by QC

## Getting Started

Requirements

- Admin access to the Google Form provided to the submitter
- [A service account with the following permissions](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account):
  - `iam.serviceAccountUser`

The service account will need [it's credentials exported](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) into the `onformsubmit-http` folder.
Rename the credentials file to `creds.json`.
Alternatively, you may change the variable `SERVICE_ACCOUNT_KEY` to direct to location of your local creds file.

### GitHub secrets

To adhere to security concerns, GitHub secrets is leveraged to handle sensitive information.
[Please look at the documentation on how to set this up](docs/SECRETS.md).
These are mainly leveraged in the automation scripts.

### The Cloud Function

After submission of the Google Form, AppScripts will call a Google function to perform the following:

- Create a workspace `POST /api/workspaces`
- Log the answers into a Firestore

A GitHub Actions workflow script has been provided to assist with deployment.
If you'd like to use another form of CI/CD for deployment, use [this file](.github/workflows/deploy-onformsubmit.http.yml) as a guide.

**NOTE: Make sure you have the correct secrets for this file to work**

### The Google Form

Google Forms have a Script Editor where you need to inject the code from the `google-form`.
The code is in `gs` format, which is based on JavaScript.
The service account will be automatically created [`appsdev-apps-dev-script-auth@system.gserviceaccount.com`](https://developers.google.com/apps-script/guides/cloud-platform-projects#default_cloud_platform_projects) and used for deployment.
Complete the setup on the account that you want error messages to report to.

**NOTE: Create the Cloud Function in GCP to get the HTTP URL before proceeding**

1. In the Triggers tab, add a Trigger with the following settings

   - "Choose which function to run": `onSubmit`
   - "Choose which deployment should run": `Head`
   - "Select event source": `From form`
   - "Select event type": `On form submit`

2. Add the code from the `google-form` folder into the files section of the Editor
   - Change the `URL` variable to the HTTP trigger for the Cloud Function
3. Add the OAuth2 Library (Version 40) into the libraries section of the Editor
4. Link the GCP project to send the form answers to in the settings section
