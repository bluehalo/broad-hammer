# Secrets

> We leverage the use of [GitHub's Encrypted Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) for deployment. However, any secret management service would work

## Management

As more secrets are added to the repository, they should be added to a list here

| Name                    | Example/Maintainer                                  | Description                                        |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------- |
| ADMIN_EMAIL             | `anvil-admins@firecloud.org`                        | The email of the AnVIL admin team                  |
| AUTHTESTCLIENTEMAIL     | `hammer@gcp-testing-308520.iam.gserviceaccount.com` | A Jest testing variable                            |
| CLIENT_EMAIL            | _Attain from `creds.json`_                          | The `client_email` field of the service account    |
| CLIENT_ID               | _Attain from `creds.json`_                          | The `client_id` field of the service account       |
| DEFAULT_BILLING_PROJECT | `anvil-dev-fhir2`                                   | The default billing project to charge to           |
| FIRECLOUD_URL           | `https://api.firecloud.org`                         | The HTTPS URL of the Firecloud client to be called |
| GCP_CREDS               | _Paste the entire `creds.json`_                     | The credentials of the service account             |
| GCP_REGION              | `us-east4`                                          | The region for the Cloud Function to be deployed   |
| PRIVATE_KEY             | _Attain from `creds.json`_                          | The `private_key` field of the service account     |
| PRIVATE_KEY_ID          | _Attain from `creds.json`_                          | The `private_key_id` field of the service account  |
| PROJECT_ID              | _Attain from `creds.json`_                          | The `project_id` field of the service account      |
| SERVICE_ACCOUNT_KEY     | `creds.json`                                        | The name/location of the creds file                |
| TEMPLATE_AUTH_DOMAIN    | `Auth_Asymmetrik_Hammer`                            | The auth domain of the template workspace          |
| TEMPLATE_NAMESPACE      | `anvil-dev-fhir2`                                   | The billing project of the template workspace      |
| TEMPLATE_WORKSPACE      | `Asymmetrik_Hammer_Template`                        | The workspace name of the template                 |
