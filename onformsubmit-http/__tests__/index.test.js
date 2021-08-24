describe("Environment Tests", () => {
  it("ensure env vars are set", async () => {
    // DEV: this will need to be updated when setting up prod
    expect(process.env.FIRECLOUD_URL).toEqual(
      "https://firecloud-orchestration.dsde-dev.broadinstitute.org"
    );
    expect(process.env.SERVICE_ACCOUNT_KEY).toEqual("creds.json");
    expect(process.env.DEFAULT_BILLING_PROJECT).toEqual(
      "general-dev-billing-account"
    );
    expect(process.env.ADMIN_EMAIL).toEqual(
      "Auth_HAMMER_Testing@dev.test.firecloud.org"
    );
  });
});
