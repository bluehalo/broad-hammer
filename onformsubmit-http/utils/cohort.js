/**
 * Holds cohort data
 * @module Cohort
 */
const {
  sequencingCenters,
  dataModels,
  questionMapping,
  fileTypeMapping,
} = require("./constants");

/** Stores cohort data */
class Cohort {
  /**
   * - dataModel: ['Common Disease', 'Rare Disease', 'Custom Data Model']
   * @param {string} institute [the sequencing center]
   * @param {string} contactName [the Terra registered contact name]
   * @param {string} dataModel [the data model]
   * @param {string} data [other attributes of the cohort to be parsed]
   */
  constructor(institute, contactName, contactEmail, dataModel, data) {
    this._sequencingCenter = sequencingCenters[institute];
    this._contactName = contactName;
    this._dataModel = dataModels[dataModel];
    this._data = data;

    // parse individual cohort data
    this._attributes = {};
    for (let [key, value] of Object.entries(this._data)) {
      if (questionMapping[key]) {
        this._attributes = {
          ...this._attributes,
          [questionMapping[key]]: value,
        };
      }
    }

    // add institute and contact name
    this._attributes = {
      "library:institute": institute,
      "library:datasetOwner": contactName,
      "library:contactEmail": contactEmail,
      ...this._attributes,
    };

    // update data use code
    if (this._attributes["library:dataUseRestriction"]) {
      const rawDataUse = this._attributes["library:dataUseRestriction"];
      const dataUseRegex = /\((.*)\)/;

      this._attributes["library:dataUseRestriction"] =
        rawDataUse.match(dataUseRegex)[1];
    }

    // update functional equivalency
    if (this._attributes["library:reference"]) {
      const rawEquivalency = this._attributes["library:reference"];

      // if unknown, delete row
      if (rawEquivalency == "I don't know") {
        delete this._attributes["library:reference"];
      } else {
        // else, remove "Yes, " prefix
        const equivalencyRegex = /Yes, (.*)/;
        this._attributes["library:reference"] =
          rawEquivalency.match(equivalencyRegex)[1];
      }
    }

    // DEV: this is an experiemntal field, but is not currently supported
    //      will leave code in place for now
    // map file types
    if (this._attributes["library:dataFileFormats.items"]) {
      const rawFileTypes = this._attributes["library:dataFileFormats.items"];

      // add file types if they are not null
      const fileTypes = [];
      for (let i = 0; i < rawFileTypes.length; i++) {
        if (rawFileTypes[i] != "null") {
          fileTypes.push(fileTypeMapping[i]);
        }
      }

      this._attributes["library:dataFileFormats.items"] = fileTypes.join(", ");
    }

    // create workspace name and auth domain from data
    const studyName = data["Cohort/Dataset Name"].replace(/ /g, "_").trim(); // replace spaces
    this._workspaceName = `AnVIL_${this._dataModel}_${this._sequencingCenter}_${studyName}`;
    this._authDomain = `Auth_${this._workspaceName}`;
    this._attributes["library:datasetName"] = this._workspaceName;
  }

  get workspaceName() {
    return this._workspaceName;
  }
  get authDomain() {
    return this._authDomain;
  }
  get dataModel() {
    return this._dataModel;
  }
  get attributes() {
    return this._attributes;
  }
}

module.exports = Cohort;
