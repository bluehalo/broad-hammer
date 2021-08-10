describe("Environment Tests", () => {
  it("ensure env vars are set", async () => {
    expect(process.env.FIRECLOUD_URL).toEqual(
      "https://firecloud-orchestration.dsde-dev.broadinstitute.org"
    );
    expect(process.env.SERVICE_ACCOUNT_KEY).toEqual("creds.json");
    expect(process.env.DEFAULT_BILLING_PROJECT).toEqual("anvil-datastorage");
    expect(process.env.ADMIN_EMAIL).toEqual("anvil-admins@firecloud.org");
  });
});
