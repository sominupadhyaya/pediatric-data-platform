import { Router } from "express";
import { buildCohort, patientDetail } from "../services/cohortService";
import { asyncHandler } from "../middleware/asyncHandler";
import { cohortQuerySchema, patientIdParamSchema } from "../validation/cohort";

export const cohortsRouter = Router();

cohortsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = cohortQuerySchema.parse(req.query);
    const { page, pageSize, ...filter } = query;
    const result = await buildCohort(filter, page, pageSize);
    res.json(result);
  })
);

cohortsRouter.get(
  "/:patientId",
  asyncHandler(async (req, res) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const detail = await patientDetail(patientId);
    if (!detail) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(detail);
  })
);
