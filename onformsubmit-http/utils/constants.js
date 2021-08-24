/**
 * Constants
 */

/*
 * Sequencing center mappings
 * - If more seqencing centers are added to the form, update them here
 */
const sequencingCenters = {
  "Albert Einstein School College": "AESC",
  "Baylor College of Medicine": "BCM",
  "The Broad Institute of MIT and Harvard": "BROAD",
  "Hudson Alpha Institute for Biotechnology": "HAIB",
  "Ichan School of Medicine at Mt. Sinai": "ISM",
  "Kaiser Permanente": "KP",
  "National Human Genome Research Institute": "NHGRI",
  "New York Genome Center": "NYGC",
  "University of California San Francisco": "UCSF",
  "University of North Carolina, Chapel Hill": "UNC",
};

/*
 * Data model mappings
 * - Custom Data Model should be flagged
 */
const dataModels = {
  "Common Disease": "CCDG",
  "Rare Disease": "CMG",
  "Custom Data Model": "CUSTOM",
};

/*
 * Google form question to attribute mappings
 */
const questionMapping = {
  "Cohort/Dataset Name": "library:datasetName",
  "Sequencing Center": "library:institute",
  // DEV: these are experimental fields (need further clarification)
  // "File Types and Count": "library:dataFileFormats.items",
  // "Data Types": "library:datatype.items",
  "Data Use Code": "library:dataUseRestriction",
  "What is the functional equivalency of this cohort?": "library:reference",
};

/*
 * Google form file type and counts mappings
 */
const fileTypeMapping = [
  "bai",
  "bam",
  "crai",
  "cram",
  "md5",
  "tab delimited",
  "vcf",
  "BigQuery table",
  "FASTQ",
  "Other",
];

module.exports = {
  sequencingCenters,
  dataModels,
  questionMapping,
  fileTypeMapping,
};
