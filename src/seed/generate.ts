import "dotenv/config";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { Patient } from "../models/Patient";
import { Condition } from "../models/Condition";
import { TreatmentCourse } from "../models/TreatmentCourse";
import { Observation } from "../models/Observation";
import {
  DIAGNOSES,
  PROTOCOLS_BY_CATEGORY,
  DRUGS_BY_CATEGORY,
  TREATMENT_TYPES,
  RACE_CATEGORIES,
  RISK_GROUPS,
} from "./reference";

const PATIENT_COUNT = Number(process.env.SEED_PATIENT_COUNT ?? 500);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedSurvival(riskGroup: string, diagnosisYear: number): {
  vitalStatus: "alive" | "deceased";
  survivalMonths: number;
} {
  const yearsSinceDiagnosis = 2026 - diagnosisYear;
  const maxFollowUpMonths = Math.max(1, yearsSinceDiagnosis * 12);

  const deathRiskByGroup: Record<string, number> = {
    low: 0.05,
    standard: 0.12,
    high: 0.25,
    very_high: 0.42,
  };
  const deathProbability = deathRiskByGroup[riskGroup] ?? 0.15;
  const deceased = Math.random() < deathProbability;

  if (deceased) {
    const survivalMonths = Math.round(faker.number.float({ min: 1, max: maxFollowUpMonths }));
    return { vitalStatus: "deceased", survivalMonths };
  }
  return { vitalStatus: "alive", survivalMonths: maxFollowUpMonths };
}

async function seed() {
  const mongoUrl = process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017/pediatric-oncology-cohort";
  await mongoose.connect(mongoUrl);
  console.log(`Connected to ${mongoUrl}`);

  console.log("Clearing existing collections...");
  await Promise.all([
    Patient.deleteMany({}),
    Condition.deleteMany({}),
    TreatmentCourse.deleteMany({}),
    Observation.deleteMany({}),
  ]);

  console.log(`Generating ${PATIENT_COUNT} synthetic patient records...`);

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const patientId = randomUUID();
    const diagnosis = pick(DIAGNOSES);
    const riskGroup = pick(RISK_GROUPS);
    const diagnosisYear = faker.number.int({ min: 2012, max: 2025 });
    const ageAtDiagnosis = faker.number.int({ min: 0, max: 19 });

    const { vitalStatus, survivalMonths } = weightedSurvival(riskGroup, diagnosisYear);
    const lastFollowUpOffsetDays = Math.round(survivalMonths * 30.4);

    await Patient.create({
      patientId,
      sex: pick(["male", "female"]),
      race: pick(RACE_CATEGORIES),
      ethnicity: pick(["hispanic_or_latino", "not_hispanic_or_latino"]),
      ageAtDiagnosis,
      diagnosisYear,
      vitalStatus,
      survivalMonths,
      lastFollowUpOffsetDays,
    });

    await Condition.create({
      patientId,
      icd10Code: diagnosis.icd10Code,
      diagnosisLabel: diagnosis.label,
      cancerCategory: diagnosis.category,
      riskGroup,
      stage: pick(["I", "II", "III", "IV"]),
    });

    const protocolName = pick(PROTOCOLS_BY_CATEGORY[diagnosis.category]);
    const drugs = DRUGS_BY_CATEGORY[diagnosis.category];
    const courseCount = faker.number.int({ min: 1, max: 3 });
    let cursorDay = faker.number.int({ min: 0, max: 14 });

    for (let c = 0; c < courseCount; c++) {
      const durationDays = faker.number.int({ min: 14, max: 180 });
      await TreatmentCourse.create({
        patientId,
        protocolName,
        treatmentType: pick(TREATMENT_TYPES),
        regimenDrugs: faker.helpers.arrayElements(drugs, { min: 1, max: drugs.length }),
        startOffsetDays: cursorDay,
        durationDays,
      });
      cursorDay += durationDays + faker.number.int({ min: 0, max: 30 });
    }

    const remission = pick(["complete_remission", "partial_remission", "no_remission"]);
    await Observation.create({
      patientId,
      code: "remission_status",
      valueString: remission,
      timepointOffsetDays: cursorDay + faker.number.int({ min: 10, max: 60 }),
    });

    if (vitalStatus === "deceased" || remission !== "complete_remission") {
      await Observation.create({
        patientId,
        code: "relapse",
        valueString: faker.datatype.boolean() ? "yes" : "no",
        timepointOffsetDays: lastFollowUpOffsetDays,
      });
    }

    if (i > 0 && i % 100 === 0) {
      console.log(`  ...${i}/${PATIENT_COUNT}`);
    }
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
