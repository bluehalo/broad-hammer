const Submission = require("../utils/submission");
const Cohort = require("../utils/cohort");

const GFORM_EXAMPLE_RESPONSE = require("./__fixtures__/gFormExampleResponse.json");

describe("Cohort Tests", () => {
  it("should sucessfully create a cohort", async () => {
    const submission = new Submission(GFORM_EXAMPLE_RESPONSE);
    const cohortMap = submission.cohortMap;
    const sequencingCenter = submission.sequencingCenter;
    const contactName = submission.contactName;
    const contactEmail = submission.email;
    const dataModel = submission.dataModel;

    // check submission is correct
    expect(submission.numCohorts).toBe(3);
    expect(contactName).toBe("Foo Bar");
    expect(contactEmail).toBe("foo@bar.com");
    expect(sequencingCenter).toBe("Albert Einstein School College");
    expect(dataModel).toBe("Common Disease");
    expect(cohortMap.length).toBe(4);

    // map each cohort
    const cohorts = [];
    cohortMap.forEach((cohortData) => {
      const cohort = new Cohort(
        sequencingCenter,
        contactName,
        contactEmail,
        dataModel,
        cohortData
      );

      cohorts.push(cohort);
    });

    // check cohort attributes
    expect(cohorts[0].attributes).toStrictEqual({
      "library:institute": "Albert Einstein School College",
      "library:datasetOwner": "Foo Bar",
      "library:contactEmail": "foo@bar.com",
      "library:datasetName": "AnVIL_CCDG_AESC_Cohort_Test_A",
      "library:dataFileFormats.items": "bai, bam",
      "library:datatype.items": ["Genome"],
      "library:dataUseRestriction": "GRU",
      "library:reference": "hg19 / GRCh37",
    });
    expect(cohorts[1].attributes).toStrictEqual({
      "library:institute": "Albert Einstein School College",
      "library:datasetOwner": "Foo Bar",
      "library:contactEmail": "foo@bar.com",
      "library:datasetName": "AnVIL_CCDG_AESC_Cohort_2:_Name",
      "library:datatype.items": [
        "Genome",
        "Exomes",
        "Phenotypes",
        "SNP Arrays",
      ],
      "library:dataUseRestriction": "RUO",
    });
    expect(cohorts[2].attributes).toStrictEqual({
      "library:institute": "Albert Einstein School College",
      "library:datasetOwner": "Foo Bar",
      "library:contactEmail": "foo@bar.com",
      "library:datasetName": "AnVIL_CCDG_AESC_cohort_3:_data",
      "library:dataFileFormats.items": "bai, bam, crai, Other",
      "library:dataUseRestriction": "RUO",
    });

    // check workspace creation vars
    expect(cohorts[0].workspaceName).toBe("AnVIL_CCDG_AESC_Cohort_Test_A");
    expect(cohorts[0].authDomain).toBe("Auth_AnVIL_CCDG_AESC_Cohort_Test_A");
    expect(cohorts[1].workspaceName).toBe("AnVIL_CCDG_AESC_Cohort_2:_Name");
    expect(cohorts[1].authDomain).toBe("Auth_AnVIL_CCDG_AESC_Cohort_2:_Name");
    expect(cohorts[2].workspaceName).toBe("AnVIL_CCDG_AESC_cohort_3:_data");
    expect(cohorts[2].authDomain).toBe("Auth_AnVIL_CCDG_AESC_cohort_3:_data");
  });
});
