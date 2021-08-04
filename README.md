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

-- TBD

A GitHub Actions workflow script has been provided to assist with deployment.
If you'd like to use another form of CI/CD for deployment, use [this file](.github/workflows/deploy-onformsubmit.http.yml) as a guide.

**NOTE: Make sure you have the correct secrets for this file to work**

### The Google Form

A Google Form has been provided as a template to kickstart the Google Function.
Instructions for implementation is included in the [google-form directory](google-form).
