import { Schema, model } from "mongoose";

export interface ObservationDoc {
  patientId: string;
  code: "remission_status" | "mrd_level" | "relapse" | "anc_count";
  valueString?: string;
  valueNumber?: number;
  timepointOffsetDays: number;
}

const observationSchema = new Schema<ObservationDoc>(
  {
    patientId: { type: String, required: true, index: true },
    code: {
      type: String,
      enum: ["remission_status", "mrd_level", "relapse", "anc_count"],
      required: true,
      index: true,
    },
    valueString: { type: String },
    valueNumber: { type: Number },
    timepointOffsetDays: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Observation = model<ObservationDoc>("Observation", observationSchema);
