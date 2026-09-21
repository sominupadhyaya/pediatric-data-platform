import { Patient } from "../models/Patient";
import { Condition } from "../models/Condition";
import { TreatmentCourse } from "../models/TreatmentCourse";
import { Observation } from "../models/Observation";

export interface CohortFilter {
  cancerCategory?: string;
  riskGroup?: string;
  ageMin?: number;
  ageMax?: number;
  sex?: string;
}

async function resolveCohortPatientIds(filter: CohortFilter): Promise<string[]> {
  const conditionMatch: Record<string, unknown> = {};
  if (filter.cancerCategory) conditionMatch.cancerCategory = filter.cancerCategory;
  if (filter.riskGroup) conditionMatch.riskGroup = filter.riskGroup;

  const patientMatch: Record<string, unknown> = {};
  if (filter.sex) patientMatch.sex = filter.sex;
  if (filter.ageMin !== undefined || filter.ageMax !== undefined) {
    patientMatch.ageAtDiagnosis = {};
    if (filter.ageMin !== undefined) (patientMatch.ageAtDiagnosis as any).$gte = filter.ageMin;
    if (filter.ageMax !== undefined) (patientMatch.ageAtDiagnosis as any).$lte = filter.ageMax;
  }

  const conditionIds = Object.keys(conditionMatch).length
    ? await Condition.find(conditionMatch).distinct("patientId")
    : null;

  const patientQuery = conditionIds ? { ...patientMatch, patientId: { $in: conditionIds } } : patientMatch;
  return Patient.find(patientQuery).distinct("patientId");
}

export async function buildCohort(filter: CohortFilter, page = 1, pageSize = 25) {
  const patientIds = await resolveCohortPatientIds(filter);
  const total = patientIds.length;

  const pageIds = patientIds.slice((page - 1) * pageSize, page * pageSize);
  const [patients, conditions] = await Promise.all([
    Patient.find({ patientId: { $in: pageIds } }).lean(),
    Condition.find({ patientId: { $in: pageIds } }).lean(),
  ]);

  const conditionByPatient = new Map(conditions.map((c) => [c.patientId, c]));
  const results = patients.map((p) => ({ ...p, condition: conditionByPatient.get(p.patientId) }));

  return { total, page, pageSize, results };
}

export async function survivalByDiagnosis() {
  return Condition.aggregate([
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "patientId",
        as: "patient",
      },
    },
    { $unwind: "$patient" },
    {
      $group: {
        _id: { cancerCategory: "$cancerCategory", riskGroup: "$riskGroup" },
        patientCount: { $sum: 1 },
        avgSurvivalMonths: { $avg: "$patient.survivalMonths" },
        deceasedCount: {
          $sum: { $cond: [{ $eq: ["$patient.vitalStatus", "deceased"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        cancerCategory: "$_id.cancerCategory",
        riskGroup: "$_id.riskGroup",
        patientCount: 1,
        avgSurvivalMonths: { $round: ["$avgSurvivalMonths", 1] },
        survivalRatePct: {
          $round: [
            {
              $multiply: [
                { $subtract: [1, { $divide: ["$deceasedCount", "$patientCount"] }] },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
    { $sort: { cancerCategory: 1, riskGroup: 1 } },
  ]);
}

export async function outcomesByProtocol() {
  return TreatmentCourse.aggregate([
    { $group: { _id: { patientId: "$patientId", protocolName: "$protocolName" } } },
    {
      $lookup: {
        from: "observations",
        let: { pid: "$_id.patientId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$patientId", "$$pid"] }, code: "remission_status" } },
          { $sort: { timepointOffsetDays: -1 } },
          { $limit: 1 },
        ],
        as: "remissionObs",
      },
    },
    {
      $group: {
        _id: "$_id.protocolName",
        patientCount: { $sum: 1 },
        completeRemission: {
          $sum: {
            $cond: [
              { $eq: [{ $arrayElemAt: ["$remissionObs.valueString", 0] }, "complete_remission"] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        protocolName: "$_id",
        patientCount: 1,
        remissionRatePct: {
          $round: [{ $multiply: [{ $divide: ["$completeRemission", "$patientCount"] }, 100] }, 1],
        },
      },
    },
    { $sort: { protocolName: 1 } },
  ]);
}

export async function demographicsSummary() {
  return Patient.aggregate([
    {
      $group: {
        _id: { race: "$race", sex: "$sex" },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, race: "$_id.race", sex: "$_id.sex", count: 1 } },
    { $sort: { race: 1, sex: 1 } },
  ]);
}

export async function patientDetail(patientId: string) {
  const [patient, condition, treatments, observations] = await Promise.all([
    Patient.findOne({ patientId }).lean(),
    Condition.findOne({ patientId }).lean(),
    TreatmentCourse.find({ patientId }).sort({ startOffsetDays: 1 }).lean(),
    Observation.find({ patientId }).sort({ timepointOffsetDays: 1 }).lean(),
  ]);
  if (!patient) return null;
  return { patient, condition, treatments, observations };
}
