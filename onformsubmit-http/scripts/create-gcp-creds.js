const fs = require("fs");

const GCP_CRED_FILENAME = "creds.json";

const { PROJECT_ID, PRIVATE_KEY_ID, PRIVATE_KEY, CLIENT_EMAIL, CLIENT_ID } =
  process.env;

fs.writeFileSync(
  GCP_CRED_FILENAME,
  JSON.stringify({
    type: "service_account",
    project_id: PROJECT_ID,
    private_key_id: PRIVATE_KEY_ID,
    private_key: PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: CLIENT_EMAIL,
    client_id: CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/hammer%40gcp-testing-308520.iam.gserviceaccount.com",
  })
);
