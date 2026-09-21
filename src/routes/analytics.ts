import { Router } from "express";
import { survivalByDiagnosis, outcomesByProtocol, demographicsSummary } from "../services/cohortService";

export const analyticsRouter = Router();

analyticsRouter.get("/survival-by-diagnosis", async (_req, res) => {
  res.json(await survivalByDiagnosis());
});

analyticsRouter.get("/outcomes-by-protocol", async (_req, res) => {
  res.json(await outcomesByProtocol());
});

analyticsRouter.get("/demographics", async (_req, res) => {
  res.json(await demographicsSummary());
});
