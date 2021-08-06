describe("Environment Tests", () => {
  it("ensure env vars are set", async () => {
    expect(process.env.FIRECLOUD_URL).toEqual(
      "https://firecloud-orchestration.dsde-dev.broadinstitute.org"
    );
    expect(process.env.SERVICE_ACCOUNT_KEY).toEqual("creds.json");
  });
});
