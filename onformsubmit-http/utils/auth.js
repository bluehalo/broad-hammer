/**
 * Handles auth for calls to the API
 * @module Auth
 */
const { existsSync } = require("fs");
const google = require("googleapis");

/** Requests and holds tokens */
class Auth {
  /**
   * @param {string} credsFile [relative path to creds file]
   */
  constructor(credsFile) {
    // validate creds file
    if (existsSync(credsFile)) {
      this._credsFile = credsFile;
    } else {
      throw new Error(`Creds file ${credsFile} not found`);
    }

    this._token = undefined;
  }

  get credsFile() {
    return this._credsFile;
  }
  get token() {
    return this._token;
  }

  /**
   * Requests Google's OAuth2 to get a token
   * @returns {Promise<string>} The access token
   */
  requestAccessToken = async () => {
    // DEV: uncomment scopes as needed
    const oAuth2Scopes = [
      // "openid",
      "email",
      "profile",
      // "https://www.googleapis.com/auth/cloud-billing",
    ];

    try {
      const googleAuthClient = new google.Auth.GoogleAuth({
        keyFile: this._credsFile,
        scopes: oAuth2Scopes,
      });

      this._token = await googleAuthClient.getAccessToken();
      return this._token;
    } catch (e) {
      throw new Error(e);
    }
  };

  /** Reads client_email from credsFile */
  get clientEmail() {
    const creds = require(`../${this._credsFile}`);
    return creds.client_email;
  }
}

module.exports = Auth;
