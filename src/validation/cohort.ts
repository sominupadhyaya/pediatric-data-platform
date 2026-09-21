import { z } from "zod";

export const cancerCategorySchema = z.enum([
  "leukemia",
  "cns_tumor",
  "lymphoma",
  "neuroblastoma",
  "bone_tumor",
  "renal_tumor",
  "soft_tissue_sarcoma",
]);

export const riskGroupSchema = z.enum(["low", "standard", "high", "very_high"]);

export const cohortQuerySchema = z.object({
  cancerCategory: cancerCategorySchema.optional(),
  riskGroup: riskGroupSchema.optional(),
  sex: z.enum(["male", "female"]).optional(),
  ageMin: z.coerce.number().int().min(0).max(19).optional(),
  ageMax: z.coerce.number().int().min(0).max(19).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type CohortQuery = z.infer<typeof cohortQuerySchema>;

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid(),
});
