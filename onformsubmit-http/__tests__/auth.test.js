const Auth = require("../utils/auth");

const CREDS_FILE = "creds.json";

describe("Auth Tests", () => {
  it("should get OAuth2 token", async () => {
    // create auth instance
    const auth = new Auth(CREDS_FILE);
    expect(auth.credsFile()).toEqual(CREDS_FILE);
    expect(auth.token()).toBeUndefined();

    // get token
    await auth.requestAccessToken();
    expect(auth.token()).toBeDefined();
  });

  it("should parse client_email from creds file", () => {
    // create auth instance
    const auth = new Auth(CREDS_FILE);

    // DEV: change this to creds file's client_email
    expect(auth.clientEmail()).toBe(process.env.authTestClientEmail);
  });

  it("should throw Error", () => {
    expect(() => {
      new Auth(null);
    }).toThrow();
  });
});
