describe("Environment Tests", () => {
  it("ensure env vars are set", async () => {
    // DEV: this will need to be updated when setting up prod
    expect(process.env.FIRECLOUD_URL).toEqual("https://api.firecloud.org");
    expect(process.env.SERVICE_ACCOUNT_KEY).toEqual("creds.json");
    expect(process.env.DEFAULT_BILLING_PROJECT).toEqual("anvil-dev-fhir2");
    expect(process.env.ADMIN_EMAIL).toEqual(
      "Auth_Asymmetrik_Hammer@firecloud.org"
    );
  });
});
