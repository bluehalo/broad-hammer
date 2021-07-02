# Secrets

> We leverage the use of [GitHub's Encrypted Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) for deployment. However, any secret management would work

## Management

As more secrets are added to the repository, they should be added to a list here

| Name           | Maintainer | Description                                            |
| -------------- | ---------- | ------------------------------------------------------ |
| GCP_PROJECT_ID | luan-asym  | The project ID of the GCP Project (not project number) |
| GCP_REGION     | luan-asym  | The region the Cloud Functions should be deployed to   |
| GCP_SA_KEY     | luan-asym  | The service account credentials for the project        |
| GCP_SA_EMAIL   | luan-asym  | The service accound email for the project              |

## Attaining Secrets

| Name           | Instructions                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| GCP_PROJECT_ID | Listed as "Project ID" in the "Project info"                                                                                                |
| GCP_REGION     | [Choose from locations listed here](https://cloud.google.com/functions/docs/locations)                                                      |
| GCP_SA_KEY     | [Export a JSON service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) |
| GCP_SA_EMAIL   | The `client-email` in the service account key JSON                                                                                          |
