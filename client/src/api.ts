import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5060";

export const api = axios.create({ baseURL: `${baseURL}/api` });

export interface SurvivalRow {
  cancerCategory: string;
  riskGroup: string;
  patientCount: number;
  avgSurvivalMonths: number;
  survivalRatePct: number;
}

export interface ProtocolOutcomeRow {
  protocolName: string;
  patientCount: number;
  remissionRatePct: number;
}

export interface DemographicsRow {
  race: string;
  sex: string;
  count: number;
}

export async function fetchSurvivalByDiagnosis(): Promise<SurvivalRow[]> {
  const res = await api.get("/analytics/survival-by-diagnosis");
  return res.data;
}

export async function fetchOutcomesByProtocol(): Promise<ProtocolOutcomeRow[]> {
  const res = await api.get("/analytics/outcomes-by-protocol");
  return res.data;
}

export async function fetchDemographics(): Promise<DemographicsRow[]> {
  const res = await api.get("/analytics/demographics");
  return res.data;
}

export interface CohortFilter {
  cancerCategory?: string;
  riskGroup?: string;
  sex?: string;
  ageMin?: number;
  ageMax?: number;
  page?: number;
}

export async function fetchCohort(filter: CohortFilter) {
  const res = await api.get("/cohorts", { params: filter });
  return res.data as {
    total: number;
    page: number;
    pageSize: number;
    results: Array<{
      patientId: string;
      sex: string;
      race: string;
      ageAtDiagnosis: number;
      vitalStatus: string;
      survivalMonths: number;
      condition?: { diagnosisLabel: string; cancerCategory: string; riskGroup: string };
    }>;
  };
}
