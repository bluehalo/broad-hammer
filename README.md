# AnVIL Data Ingestion

> Automation for AnVIL data submitters to self service their code before manual review by QC

## Getting Started

Requirements

- Admin access to the Google Form provided to the submitter

### GitHub secrets

To adhere to security concerns, GitHub secrets is leveraged to handle sensitive information.
[Please look at the documentation on how to set this up](docs/SECRETS.md)

### The Google Form

Google Forms have a Script Editor where you need to inject the code from the `google-form`.
The code is in `gs` format, which is based on JavaScript.
The service account will be automatically created [`appsdev-apps-dev-script-auth@system.gserviceaccount.com`](https://developers.google.com/apps-script/guides/cloud-platform-projects#default_cloud_platform_projects).
Complete the setup on the account that you want error messages to report to.

> Create the Cloud Function in GCP to get the HTTP URL before proceeding

1. In the Triggers tab, add a Trigger with the following settings

   - "Choose which function to run": `onSubmit`
   - "Choose which deployment should run": `Head`
   - "Select event source": `From form`
   - "Select event type": `On form submit`

2. Add the code from the `google-form` folder into the files section of the Editor
   - Change the `URL` variable to the HTTP trigger for the Cloud Function
3. Add the OAuth2 Library (Version 40) into the libraries section of the Editor
4. Link the GCP project to send the form answers to in the settings section
