const axios = require("axios").default;

const Auth = require("../utils/auth");
const Firecloud = require("../utils/firecloud");

// axios setup
const SERVICE_ACCOUNT_KEY = "creds.json";
const FIRECLOUD_URL =
  "https://firecloud-orchestration.dsde-dev.broadinstitute.org/";

describe("Firecloud Tests", () => {
  beforeAll(async () => {
    // setup axios client
    const auth = new Auth(SERVICE_ACCOUNT_KEY);

    const bearerToken = await auth.requestAccessToken();
    expect(bearerToken).toBeDefined();

    axios.defaults.baseURL = FIRECLOUD_URL;
    axios.defaults.headers.common.Authorization = `Bearer ${bearerToken}`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // DEV: these will need to be changed before prod
  it("should test env variables are loaded properly", () => {
    const firecloud = new Firecloud(axios);
    expect(firecloud.DEFAULT_TEMPLATE_NAMESPACE).toBe("anvil-dev-fhir2");
    expect(firecloud.DEFAULT_TEMPLATE_WORKSPACE).toBe(
      "Asymmetrik_Hammer_Template"
    );
    expect(firecloud.DEFAULT_BILLING_PROJECT).toBe("anvil-dev-fhir2");
  });

  it("should make request to /api/groups", async () => {
    const firecloud = new Firecloud(axios);

    const groupsPOSTSpy = jest.spyOn(axios, "post").mockResolvedValue({
      data: {
        groupEmail: "HAMMER_Jest@dev.test.firecloud.org",
      },
    });
    const groupsPUTSpy = jest.spyOn(axios, "put").mockImplementation();
    const groupsDELETESpy = jest.spyOn(axios, "delete").mockImplementation();
    // create group
    await firecloud.createGroup("HAMMER_Jest");

    // add users
    await firecloud.addUserToGroup("HAMMER_Jest", "foo@bar.com", "admin");
    await firecloud.addUserToGroup("HAMMER_Jest", "f@b.com");

    // remove users
    await firecloud.removeUserFromGroup("HAMMER_Jest", "foo@bar.com", "admin");
    await firecloud.removeUserFromGroup("HAMMER_Jest", "f@b.com");

    expect(firecloud.groupEmail).toBe("HAMMER_Jest@dev.test.firecloud.org");
    expect(await groupsPOSTSpy).toHaveBeenCalledWith("/api/groups/HAMMER_Jest");
    expect(await groupsPUTSpy.mock.calls).toEqual([
      ["/api/groups/HAMMER_Jest/admin/foo@bar.com"],
      ["/api/groups/HAMMER_Jest/member/f@b.com"],
    ]);
    expect(await groupsDELETESpy.mock.calls).toEqual([
      ["/api/groups/HAMMER_Jest/admin/foo@bar.com"],
      ["/api/groups/HAMMER_Jest/member/f@b.com"],
    ]);
  });

  it("should make requests to /api/workspaces/{workspaceNamespace}/{workspaceName}/clone", async () => {
    const firecloud = new Firecloud(axios);

    const workspacePOSTSpy = jest.spyOn(axios, "post").mockImplementation();
    const workspacePATCHSpy = jest.spyOn(axios, "patch").mockImplementation();

    // DEV: hacky way to create workspace on dev env
    // const workspaceName = `HAMMER_TEST_${Math.floor(Math.random() * 100)}`;
    const workspaceName = "HAMMER_TEST";

    // clone workspace
    await firecloud.cloneWorkspace(
      workspaceName,
      "Auth_HAMMER_Testing",
      {},
      "general-dev-billing-account",
      "HAMMER_Template",
      "general-dev-billing-account"
    );

    // add user
    await firecloud.addUserToWorkspace(
      workspaceName,
      "general-dev-billing-account",
      "foo@bar.com",
      "OWNER"
    );

    expect(await workspacePOSTSpy).toHaveBeenCalledWith(
      "/api/workspaces/general-dev-billing-account/HAMMER_Template/clone",
      {
        attributes: {},
        name: workspaceName,
        authorizationDomain: [
          { membersGroupName: "Auth_HAMMER_Testing" },
          { membersGroupName: `${process.env.TEMPLATE_AUTH_DOMAIN}` },
        ],
        namespace: "general-dev-billing-account",
        copyFilesWithPrefix: "notebooks/",
        noWorkspaceOwner: false,
      }
    );
    expect(await workspacePATCHSpy.mock.calls).toEqual([
      [
        `/api/workspaces/general-dev-billing-account/${workspaceName}/acl?inviteUsersNotFound=true`,
        [
          {
            email: "foo@bar.com",
            accessLevel: "OWNER",
            canShare: true,
            canCompute: true,
          },
        ],
      ],
    ]);
  });

  it("should make requests to /api/workspaces", async () => {
    const firecloud = new Firecloud(axios);

    const workspacePOSTSpy = jest.spyOn(axios, "post").mockImplementation();
    const workspacePATCHSpy = jest.spyOn(axios, "patch").mockImplementation();

    // DEV: hacky way to create workspace on dev env
    // const workspaceName = `HAMMER_TEST_${Math.floor(Math.random() * 100)}`;
    const workspaceName = "HAMMER_TEST";

    // create workspace
    await firecloud.createWorkspace(
      workspaceName,
      "HAMMER_Jest",
      "general-dev-billing-account"
    );

    // add users
    await firecloud.addUserToWorkspace(
      workspaceName,
      "general-dev-billing-account",
      "foo@bar.com"
    );
    await firecloud.addUserToWorkspace(
      workspaceName,
      "general-dev-billing-account",
      "f@b.com",
      "WRITER"
    );

    // remove users
    await firecloud.removeUserFromWorkspace(
      workspaceName,
      "general-dev-billing-account",
      "foo@bar.com"
    );

    expect(await workspacePOSTSpy).toHaveBeenCalledWith("/api/workspaces", {
      attributes: {},
      name: workspaceName,
      authorizationDomain: [{ membersGroupName: "HAMMER_Jest" }],
      namespace: "general-dev-billing-account",
      noWorkspaceOwner: false,
    });
    expect(await workspacePATCHSpy.mock.calls).toEqual([
      [
        `/api/workspaces/general-dev-billing-account/${workspaceName}/acl?inviteUsersNotFound=true`,
        [
          {
            email: "foo@bar.com",
            accessLevel: "READER",
            canShare: true,
            canCompute: true,
          },
        ],
      ],
      [
        `/api/workspaces/general-dev-billing-account/${workspaceName}/acl?inviteUsersNotFound=true`,
        [
          {
            email: "f@b.com",
            accessLevel: "WRITER",
            canShare: true,
            canCompute: true,
          },
        ],
      ],
      [
        `/api/workspaces/general-dev-billing-account/${workspaceName}/acl`,
        [
          {
            email: "foo@bar.com",
            accessLevel: "NO ACCESS",
            canShare: false,
            canCompute: false,
          },
        ],
      ],
    ]);
  });
});
