/**
 * Handles Firecloud calls
 * @module Firecloud
 */

/** Sends HTTP requests */
class Firecloud {
  /**
   * @param {Object} http [the configured http client]
   */
  constructor(http) {
    this._http = http;

    this._groupEmail = undefined;

    this._DEFAULT_TEMPLATE_WORKSPACE = process.env.TEMPLATE_WORKSPACE;
    this._DEFAULT_TEMPLATE_NAMESPACE = process.env.TEMPLATE_NAMESPACE;
    this._DEFAULT_TEMPLATE_AUTH_DOMAIN = process.env.TEMPLATE_AUTH_DOMAIN;
    this._DEFAULT_BILLING_PROJECT = process.env.DEFAULT_BILLING_PROJECT;
  }

  get http() {
    return this._http;
  }
  get groupEmail() {
    return this._groupEmail;
  }
  get DEFAULT_TEMPLATE_WORKSPACE() {
    return this._DEFAULT_TEMPLATE_WORKSPACE;
  }
  get DEFAULT_TEMPLATE_NAMESPACE() {
    return this._DEFAULT_TEMPLATE_NAMESPACE;
  }
  get DEFAULT_TEMPLATE_AUTH_DOMAIN() {
    return this._DEFAULT_TEMPLATE_AUTH_DOMAIN;
  }
  get DEFAULT_BILLING_PROJECT() {
    return this._DEFAULT_BILLING_PROJECT;
  }

  /**
   * Creates a new Terra group and adds users
   * @param {string} groupName [the name of the group to create]
   * @param {Array.<string>} userEmails [the description of the group to create]
   */
  createGroup = async (groupName) => {
    try {
      await this._http.post(`/api/groups/${groupName}`).then((res) => {
        this._groupEmail = res.data.groupEmail;
      });
    } catch (e) {
      throw new Error(`/api/groups/${groupName} ${e}`);
    }

    // if group wasn't created, throw an error
    if (this._groupEmail) {
      return this._groupEmail;
    } else {
      throw new Error("Group was not created");
    }
  };

  /**
   * Add a user to a group
   * - role: ['member', 'admin']
   * @param {string} groupName [the name of the group]
   * @param {string} userEmail [the email of the user to add]
   * @param {string} [role='member'] [the role to assign to the user]
   */
  addUserToGroup = async (groupName, userEmail, role = "member") => {
    try {
      await this._http.put(`/api/groups/${groupName}/${role}/${userEmail}`);
    } catch (e) {
      throw new Error(`/api/groups/${groupName}/${role}/${userEmail} ${e}`);
    }
  };

  /**
   * Removes a user from a group
   * @param {string} groupName [the name of the group]
   * @param {string} userEmail [the email of the user to remove]
   * @param {string} [role='member'] [the role of the user to be removed]
   */
  removeUserFromGroup = async (groupName, userEmail, role = "member") => {
    try {
      await this._http.delete(`/api/groups/${groupName}/${role}/${userEmail}`);
    } catch (e) {
      throw new Error(`/api/groups/${groupName}/${role}/${userEmail} ${e}`);
    }
  };

  /**
   * @deprecated Creates workspace
   * @param {string} workspaceName [the name of the workspace to create]
   * @param {string} authDomain [the auth domain to use]
   * @param {string} [billingProject=] [the billing project to use]
   */
  createWorkspace = async (
    workspaceName,
    authDomain,
    billingProject = this._DEFAULT_BILLING_PROJECT
  ) => {
    const workspaceRequest = {
      name: workspaceName,
      namespace: billingProject,
      authorizationDomain: [
        {
          membersGroupName: authDomain,
        },
      ],
      attributes: {},
      noWorkspaceOwner: false,
    };

    try {
      await this._http.post("/api/workspaces", workspaceRequest);
    } catch (e) {
      throw new Error(`/api/workspaces ${e}`);
    }
  };

  /**
   * Deep clones workspace from template workspace
   * @param {string} workspaceName [the name of the workspace to create]
   * @param {string} authDomain [the auth domain to use]
   * @param {string} [attributes={}] [attributes for the project]
   * @param {string} [billingProject=] [the billing project to use]
   * @param {string} [templateWorkspaceName=] [the name of the template to use]
   * @param {string} [templateNamespace=] [the billing project of the template to use]
   */
  cloneWorkspace = async (
    workspaceName,
    authDomain,
    attributes = {},
    billingProject = this._DEFAULT_BILLING_PROJECT,
    templateWorkspace = this._DEFAULT_TEMPLATE_WORKSPACE,
    templateNamespace = this._DEFAULT_TEMPLATE_NAMESPACE
  ) => {
    const workspaceRequest = {
      name: workspaceName,
      namespace: billingProject,
      authorizationDomain: [
        {
          membersGroupName: authDomain,
        },
        {
          membersGroupName: this._DEFAULT_TEMPLATE_AUTH_DOMAIN,
        },
      ],
      attributes: attributes,
      copyFilesWithPrefix: "notebooks/",
      noWorkspaceOwner: false,
    };

    try {
      await this._http.post(
        `/api/workspaces/${templateNamespace}/${templateWorkspace}/clone`,
        workspaceRequest
      );
    } catch (e) {
      throw new Error(
        `/api/workspaces/${templateNamespace}/${templateWorkspace}/clone ${e}`
      );
    }
  };

  /**
   * Adds a user to a workspace
   * - accessLevel: ["OWNER", "READER", "WRITER", "NO ACCESS"]
   * @param {string} workspaceName [the name of the workspace]
   * @param {string} billingProject [the billing project used]
   * @param {string} userEmail [the email of the user/group to add]
   * @param {string} [accessLevel='READER'] [the role to assign to the user]
   */
  addUserToWorkspace = async (
    workspaceName,
    billingProject,
    userEmail,
    accessLevel = "READER"
  ) => {
    const aclRequest = [
      {
        email: userEmail,
        accessLevel: accessLevel,
        canShare: true,
        canCompute: true,
      },
    ];

    try {
      await this._http.patch(
        `/api/workspaces/${billingProject}/${workspaceName}/acl?inviteUsersNotFound=true`,
        aclRequest
      );
    } catch (e) {
      throw new Error(
        `/api/workspaces/${billingProject}/${workspaceName}/acl?inviteUsersNotFound=true ${e}`
      );
    }
  };

  /**
   * Removes a user from a workspace
   *
   * @param {string} workspaceName [the name of the workspace]
   * @param {string} billingProject [the billing project used]
   * @param {string} userEmail [the email of the user/group to remove]
   */
  removeUserFromWorkspace = async (
    workspaceName,
    billingProject,
    userEmail
  ) => {
    const aclRemoveRequest = [
      {
        email: userEmail,
        accessLevel: "NO ACCESS",
        canShare: false,
        canCompute: false,
      },
    ];

    try {
      await this._http.patch(
        `/api/workspaces/${billingProject}/${workspaceName}/acl`,
        aclRemoveRequest
      );
    } catch (e) {
      throw new Error(
        `/api/workspaces/${billingProject}/${workspaceName}/acl ${e}`
      );
    }
  };
}

module.exports = Firecloud;
