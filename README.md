# AnVIL Data Ingestion

> Automation for AnVIL data submitters to self service their code before manual review by QC

## Getting Started

Requirements

- Admin access to the Google Form provided to the submitter
- [A service account with the following permissions](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account):
  - `iam.serviceAccountUser`
  - `cloudfunctions.developer`

The service account will need [it's credentials exported](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) into the `onformsubmit-http` folder.
Rename the credentials file to `creds.json`.
Alternatively, you may change the variable `SERVICE_ACCOUNT_KEY` to direct to location of your local creds file.

### GitHub secrets

To adhere to security concerns, GitHub secrets is leveraged to handle sensitive information.
[Please look at the documentation on how to set this up](docs/SECRETS.md).
These are mainly leveraged in the automation scripts.

### The Cloud Function

After submission of the Google Form, AppScripts will send form submission info to the Cloud Function to perform the following for each cohort:

- Create an auth domain
  - Add the AnVIL admins to the auth domain _as `admin`_
  - Add each user to the auth domain _as `admin`_
- Clone a workspace from the template workspace
  - Add workspace attributes from the form submission
  - Add the AnVIL admins to the workspace _as `OWNER`_
  - Add the group email from the auth domain to the workspace _as `OWNER`_

A GitHub Actions workflow script has been provided to assist with deployment.
If you'd like to use another form of CI/CD for deployment, use [this file](.github/workflows/deploy-onformsubmit.http.yml) as a guide.

**NOTE: Ensure sure you setup your secrets properly**

### The Google Form

A Google Form has been provided as a template to kickstart the Cloud Function.
Instructions for implementation is included in the [google-form directory](google-form/README.md).
Implement the Google Form **after** implementing the Cloud Function (the form requires a Trigger URL).

## Implementation Notes

- Unit tests have been included and are required to pass before deployment
- The `scripts` folder contains code used by GitHub Actions to create the `env` and `creds.json` file
- The `dataModels` contains `tsv` files for reference, but not currently used
- [SonarQube](https://www.sonarqube.org/) is used for code quality checks, but must be reconfigured to work locally
