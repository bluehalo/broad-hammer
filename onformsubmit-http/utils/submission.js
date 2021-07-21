/**
 * Handles the submission data from form
 * @module Submission
 */

/** Holds and processes submission message */
class Submission {
  /**
   * @param {string} message [payload of http request]
   */
  constructor(message) {
    try {
      this._submissionTime = message.submissionTime;
      this._email = message.email;
      this._editLink = message.editLink;
      this._qaMap = new Map();

      // map questions and responses
      const questions = JSON.parse(message.questions);
      const responses = JSON.parse(message.responses);
      for (let i = 0; i < questions.length; i++) {
        this._qaMap.set(questions[i], responses[i]);
      }
    } catch (e) {
      throw new Error("Submission data malformed");
    }
  }

  /** Displays submission contents */
  display = () => {
    console.info("--Submission Data--");
    console.info(`${this._submissionTime}: ${this._email}`);
    console.info(`  ${this._editLink}`);
  };

  // Getters
  submissionTime = () => this._submissionTime;
  email = () => this._email;
  editLink = () => this._editLink;
  qaMap = () => this._qaMap;
}

module.exports = Submission;
