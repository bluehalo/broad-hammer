/**
 * Handles the submission data from form
 * @module Submission
 */
const { writeFileSync } = require("fs");

/** Holds and processes submission message */
class Submission {
  /**
   * @param {Object<JSON>} message [payload of http request]
   */
  constructor(message) {
    try {
      this._submissionTime = message.submissionTime;
      this._email = message.email;
      this._editLink = message.editLink;

      // deep copy and remove bulk QA data
      this._json = { ...message };
      delete this._json.questions;
      delete this._json.responses;

      // map questions and responses
      const questions = JSON.parse(message.questions);
      const responses = JSON.parse(message.responses);
      this._cohortMap = [];
      for (let i = 0; i < questions.length; i++) {
        this._json[questions[i]] = responses[i];

        const cohortRegex = /^Cohort ([1-8]): /;
        if (questions[i].match(cohortRegex)) {
          const question = questions[i];
          const cohortNumber = question.match(cohortRegex)[1];
          const cohortQuestion = question.replace(cohortRegex, "");

          const currEntry = this._cohortMap[cohortNumber];
          this._cohortMap[cohortNumber] = {
            ...currEntry,
            [cohortQuestion]: responses[i],
          };
        }
      }

      // double check gform data
      if (!this._editLink) {
        throw new Error("Submission does not contain edit link");
      }
    } catch (e) {
      throw new Error("Submission data malformed");
    }
  }

  get submissionTime() {
    return this._submissionTime;
  }
  get email() {
    return this._email;
  }
  get editLink() {
    return this._editLink;
  }
  get json() {
    return this._json;
  }
  get contactName() {
    return this._json["Terra Registered Contact Name"];
  }
  get sequencingCenter() {
    return this._json["Sequencing Center"];
  }
  get numCohorts() {
    return parseInt(this._json["How many data cohorts do you need to submit?"]);
  }
  get dataModel() {
    if (this._json["Do you have a data model you wish to use?"] == "Yes") {
      return "Custom Data Model";
    } else {
      return this._json["Choose the data model you wish to use"];
    }
  }
  get cohortMap() {
    return this._cohortMap;
  }

  /**
   * @deprecated Saves the submission data to file
   * @param {string} [filePath='submission.json'] [path to save the file]
   */
  saveToFile = (filePath = "submission.json") => {
    writeFileSync(filePath, JSON.stringify(this._json));
  };

  /** Displays submission contents */
  display = () => {
    console.info("--Submission Metadata--");
    console.info(`${this._submissionTime}: ${this._email}`);
    console.info(`  ${this._editLink}`);
  };
}

module.exports = Submission;
