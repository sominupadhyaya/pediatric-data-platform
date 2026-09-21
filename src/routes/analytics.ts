import { Router } from "express";
import { survivalByDiagnosis, outcomesByProtocol, demographicsSummary } from "../services/cohortService";
import { asyncHandler } from "../middleware/asyncHandler";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/survival-by-diagnosis",
  asyncHandler(async (_req, res) => {
    res.json(await survivalByDiagnosis());
  })
);

analyticsRouter.get(
  "/outcomes-by-protocol",
  asyncHandler(async (_req, res) => {
    res.json(await outcomesByProtocol());
  })
);

analyticsRouter.get(
  "/demographics",
  asyncHandler(async (_req, res) => {
    res.json(await demographicsSummary());
  })
);
