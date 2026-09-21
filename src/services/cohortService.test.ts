import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomUUID } from "crypto";
import { Patient } from "../models/Patient";
import { Condition } from "../models/Condition";
import { TreatmentCourse } from "../models/TreatmentCourse";
import { Observation } from "../models/Observation";
import { buildCohort, survivalByDiagnosis, outcomesByProtocol, patientDetail } from "./cohortService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    Patient.deleteMany({}),
    Condition.deleteMany({}),
    TreatmentCourse.deleteMany({}),
    Observation.deleteMany({}),
  ]);
});

async function makePatient(overrides: Partial<Parameters<typeof Patient.create>[0]> = {}) {
  const patientId = randomUUID();
  await Patient.create({
    patientId,
    sex: "female",
    race: "Asian",
    ethnicity: "not_hispanic_or_latino",
    ageAtDiagnosis: 8,
    diagnosisYear: 2020,
    vitalStatus: "alive",
    survivalMonths: 24,
    lastFollowUpOffsetDays: 730,
    ...overrides,
  });
  return patientId;
}

describe("buildCohort", () => {
  it("filters by cancer category and risk group", async () => {
    const matchId = await makePatient();
    await Condition.create({
      patientId: matchId,
      icd10Code: "C91.00",
      diagnosisLabel: "Acute Lymphoblastic Leukemia",
      cancerCategory: "leukemia",
      riskGroup: "standard",
      stage: "II",
    });

    const otherId = await makePatient();
    await Condition.create({
      patientId: otherId,
      icd10Code: "C71.9",
      diagnosisLabel: "Medulloblastoma",
      cancerCategory: "cns_tumor",
      riskGroup: "high",
      stage: "III",
    });

    const result = await buildCohort({ cancerCategory: "leukemia" });
    expect(result.total).toBe(1);
    expect(result.results[0].patientId).toBe(matchId);
  });

  it("filters by age range", async () => {
    await makePatient({ ageAtDiagnosis: 2 });
    await makePatient({ ageAtDiagnosis: 15 });

    const result = await buildCohort({ ageMin: 10, ageMax: 19 });
    expect(result.total).toBe(1);
    expect(result.results[0].ageAtDiagnosis).toBe(15);
  });

  it("paginates results", async () => {
    for (let i = 0; i < 5; i++) await makePatient();

    const page1 = await buildCohort({}, 1, 2);
    const page2 = await buildCohort({}, 2, 2);

    expect(page1.total).toBe(5);
    expect(page1.results).toHaveLength(2);
    expect(page2.results).toHaveLength(2);
    expect(page1.results[0].patientId).not.toBe(page2.results[0].patientId);
  });
});

describe("survivalByDiagnosis", () => {
  it("computes survival rate and average survival months per group", async () => {
    const aliveId = await makePatient({ vitalStatus: "alive", survivalMonths: 36 });
    await Condition.create({
      patientId: aliveId,
      icd10Code: "C91.00",
      diagnosisLabel: "Acute Lymphoblastic Leukemia",
      cancerCategory: "leukemia",
      riskGroup: "standard",
      stage: "II",
    });

    const deceasedId = await makePatient({ vitalStatus: "deceased", survivalMonths: 12 });
    await Condition.create({
      patientId: deceasedId,
      icd10Code: "C91.00",
      diagnosisLabel: "Acute Lymphoblastic Leukemia",
      cancerCategory: "leukemia",
      riskGroup: "standard",
      stage: "IV",
    });

    const rows = await survivalByDiagnosis();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      cancerCategory: "leukemia",
      riskGroup: "standard",
      patientCount: 2,
      avgSurvivalMonths: 24,
      survivalRatePct: 50,
    });
  });
});

describe("outcomesByProtocol", () => {
  it("computes remission rate per protocol using the latest remission observation", async () => {
    const patientId = await makePatient();
    await TreatmentCourse.create({
      patientId,
      protocolName: "COG AALL0932",
      treatmentType: "chemotherapy",
      regimenDrugs: ["vincristine"],
      startOffsetDays: 0,
      durationDays: 30,
    });
    await Observation.create({
      patientId,
      code: "remission_status",
      valueString: "partial_remission",
      timepointOffsetDays: 30,
    });
    await Observation.create({
      patientId,
      code: "remission_status",
      valueString: "complete_remission",
      timepointOffsetDays: 90,
    });

    const rows = await outcomesByProtocol();
    expect(rows).toEqual([
      { protocolName: "COG AALL0932", patientCount: 1, remissionRatePct: 100 },
    ]);
  });
});

describe("patientDetail", () => {
  it("returns null for an unknown patient", async () => {
    expect(await patientDetail(randomUUID())).toBeNull();
  });

  it("assembles condition, treatments and observations for a known patient", async () => {
    const patientId = await makePatient();
    await Condition.create({
      patientId,
      icd10Code: "C91.00",
      diagnosisLabel: "Acute Lymphoblastic Leukemia",
      cancerCategory: "leukemia",
      riskGroup: "standard",
      stage: "II",
    });
    await TreatmentCourse.create({
      patientId,
      protocolName: "COG AALL0932",
      treatmentType: "chemotherapy",
      regimenDrugs: ["vincristine"],
      startOffsetDays: 0,
      durationDays: 30,
    });

    const detail = await patientDetail(patientId);
    expect(detail?.patient?.patientId).toBe(patientId);
    expect(detail?.condition?.diagnosisLabel).toBe("Acute Lymphoblastic Leukemia");
    expect(detail?.treatments).toHaveLength(1);
  });
});
