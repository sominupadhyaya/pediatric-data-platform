import { Schema, model } from "mongoose";

export type CancerCategory =
  | "leukemia"
  | "cns_tumor"
  | "lymphoma"
  | "neuroblastoma"
  | "bone_tumor"
  | "renal_tumor"
  | "soft_tissue_sarcoma";

export interface ConditionDoc {
  patientId: string;
  icd10Code: string;
  diagnosisLabel: string;
  cancerCategory: CancerCategory;
  riskGroup: "low" | "standard" | "high" | "very_high";
  stage: string;
}

const conditionSchema = new Schema<ConditionDoc>(
  {
    patientId: { type: String, required: true, index: true },
    icd10Code: { type: String, required: true },
    diagnosisLabel: { type: String, required: true },
    cancerCategory: {
      type: String,
      enum: [
        "leukemia",
        "cns_tumor",
        "lymphoma",
        "neuroblastoma",
        "bone_tumor",
        "renal_tumor",
        "soft_tissue_sarcoma",
      ],
      required: true,
      index: true,
    },
    riskGroup: {
      type: String,
      enum: ["low", "standard", "high", "very_high"],
      required: true,
    },
    stage: { type: String, required: true },
  },
  { timestamps: true }
);

export const Condition = model<ConditionDoc>("Condition", conditionSchema);
