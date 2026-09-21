import { Schema, model } from "mongoose";

export interface PatientDoc {
  patientId: string;
  sex: "male" | "female";
  race: string;
  ethnicity: "hispanic_or_latino" | "not_hispanic_or_latino";
  ageAtDiagnosis: number;
  diagnosisYear: number;
  vitalStatus: "alive" | "deceased";
  survivalMonths: number;
  lastFollowUpOffsetDays: number;
}

const patientSchema = new Schema<PatientDoc>(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    sex: { type: String, enum: ["male", "female"], required: true },
    race: { type: String, required: true },
    ethnicity: {
      type: String,
      enum: ["hispanic_or_latino", "not_hispanic_or_latino"],
      required: true,
    },
    ageAtDiagnosis: { type: Number, required: true, min: 0, max: 19 },
    diagnosisYear: { type: Number, required: true },
    vitalStatus: { type: String, enum: ["alive", "deceased"], required: true },
    survivalMonths: { type: Number, required: true, min: 0 },
    lastFollowUpOffsetDays: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Patient = model<PatientDoc>("Patient", patientSchema);
