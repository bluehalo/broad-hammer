describe("Environment Tests", () => {
  it("ensure env vars are set", async () => {
    expect(process.env.FIRECLOUD_URL).toEqual("https://api.firecloud.org");
    expect(process.env.SERVICE_ACCOUNT_KEY).toEqual("creds.json");
    // DEV: This will need to be changed to `anvil-datastorage` before prod
    expect(process.env.DEFAULT_BILLING_PROJECT).toEqual("anvil-dev-fhir2");
    expect(process.env.ADMIN_EMAIL).toEqual("anvil-admins@firecloud.org");
  });
});
