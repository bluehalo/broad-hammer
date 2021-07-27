const Submission = require("../utils/submission");

const GFORM_TEST_MESSAGE = require(`./__fixtures__/gFormTestMessage.json`);
const GFORM_FAIL_MESSAGE = require(`./__fixtures__/gFormFailMessage.json`);

describe("Submission Tests", () => {
  it("should accept message parsing and display message", async () => {
    const submission = new Submission(GFORM_TEST_MESSAGE);
    expect(submission.submissionTime()).toEqual(
      "Sun Sept 19 2021 12:00:00 GMT-0400 (Eastern Daylight Time)"
    );
    expect(submission.email()).toEqual("foo@bar.com");
    expect(submission.editLink()).toEqual("https://foobar.com");

    // check qa mapping
    const qaMap = submission.qaMap();
    expect(qaMap.size).toEqual(8);
    expect(qaMap.get("Create Bucket?")).toEqual("True");
    expect(qaMap.get("Bucket Name")).toEqual("bucket");
    expect(qaMap.get("Q1: Multiple Choice")).toEqual("C");
    expect(qaMap.get("Q2: Checkbox")).toEqual(["Option 2", "other"]);
    expect(qaMap.get("Q3: Paragraph")).toEqual(
      "obtuse, rubber goose, green moose, guava juice"
    );
    expect(qaMap.get("Group Name")).toEqual("AUTH_Group");
    expect(qaMap.get("Billing Project")).toEqual("billing-account");
    expect(qaMap.get("Workspace Name")).toEqual("hammer_test_space");

    // check required fields
    expect(submission.groupName()).toEqual("AUTH_Group");
    expect(submission.billingProject()).toEqual("billing-account");
    expect(submission.workspaceName()).toEqual("hammer_test_space");

    // check console log
    console.info = jest.fn();
    submission.display();
    expect(console.info).toHaveBeenCalledWith("--Submission Metadata--");
    expect(console.info).toHaveBeenCalledWith(
      "Sun Sept 19 2021 12:00:00 GMT-0400 (Eastern Daylight Time): foo@bar.com"
    );
    expect(console.info).toHaveBeenCalledWith("  https://foobar.com");
  });

  it("should throw failure message when parsing", async () => {
    expect(() => {
      try {
        new Submission(GFORM_FAIL_MESSAGE);
      } catch (e) {
        throw new Error(e.message);
      }
    }).toThrow("Submission data malformed");
  });
});
