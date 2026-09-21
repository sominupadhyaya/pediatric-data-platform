import { Schema, model } from "mongoose";

export interface TreatmentCourseDoc {
  patientId: string;
  protocolName: string;
  treatmentType: "chemotherapy" | "radiation" | "surgery" | "transplant" | "immunotherapy";
  regimenDrugs: string[];
  startOffsetDays: number;
  durationDays: number;
}

const treatmentCourseSchema = new Schema<TreatmentCourseDoc>(
  {
    patientId: { type: String, required: true, index: true },
    protocolName: { type: String, required: true, index: true },
    treatmentType: {
      type: String,
      enum: ["chemotherapy", "radiation", "surgery", "transplant", "immunotherapy"],
      required: true,
    },
    regimenDrugs: [{ type: String }],
    startOffsetDays: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const TreatmentCourse = model<TreatmentCourseDoc>(
  "TreatmentCourse",
  treatmentCourseSchema
);
