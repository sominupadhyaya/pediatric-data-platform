import { Router } from "express";
import { buildCohort, patientDetail } from "../services/cohortService";

export const cohortsRouter = Router();

cohortsRouter.get("/", async (req, res) => {
  const { cancerCategory, riskGroup, sex, ageMin, ageMax, page, pageSize } = req.query;

  const filter = {
    cancerCategory: cancerCategory as string | undefined,
    riskGroup: riskGroup as string | undefined,
    sex: sex as string | undefined,
    ageMin: ageMin !== undefined ? Number(ageMin) : undefined,
    ageMax: ageMax !== undefined ? Number(ageMax) : undefined,
  };

  const result = await buildCohort(
    filter,
    page ? Number(page) : 1,
    pageSize ? Number(pageSize) : 25
  );
  res.json(result);
});

cohortsRouter.get("/:patientId", async (req, res) => {
  const detail = await patientDetail(req.params.patientId);
  if (!detail) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(detail);
});
