const Submission = require("../utils/submission");

// mock fs for submission testing
jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}));
const fs = require("fs");

// import fixtures
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

    // check json mapping
    expect(submission.json()).toEqual({
      editLink: "https://foobar.com",
      email: "foo@bar.com",
      submissionTime:
        "Sun Sept 19 2021 12:00:00 GMT-0400 (Eastern Daylight Time)",
      "Create Bucket?": "True",
      "Bucket Name": "bucket",
      "Q1: Multiple Choice": "C",
      "Q2: Checkbox": ["Option 2", "other"],
      "Q3: Paragraph": "obtuse, rubber goose, green moose, guava juice",
      "Group Name": "AUTH_Group",
      "Billing Project": "billing-account",
      "Workspace Name": "hammer_test_space",
    });

    // check required fields
    expect(submission.billingProject()).toEqual("billing-account");

    // check console log
    console.info = jest.fn();
    submission.display();
    expect(console.info).toHaveBeenCalledWith("--Submission Metadata--");
    expect(console.info).toHaveBeenCalledWith(
      "Sun Sept 19 2021 12:00:00 GMT-0400 (Eastern Daylight Time): foo@bar.com"
    );
    expect(console.info).toHaveBeenCalledWith("  https://foobar.com");
  });

  it("should save submission data to json file", () => {
    const submission = new Submission(GFORM_TEST_MESSAGE);
    submission.saveToFile("submission.json");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "submission.json",
      JSON.stringify(submission.json())
    );
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
