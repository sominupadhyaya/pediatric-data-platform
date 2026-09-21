import { CancerCategory } from "../models/Condition";

export const DIAGNOSES: Array<{
  icd10Code: string;
  label: string;
  category: CancerCategory;
}> = [
  { icd10Code: "C91.00", label: "Acute Lymphoblastic Leukemia", category: "leukemia" },
  { icd10Code: "C92.00", label: "Acute Myeloid Leukemia", category: "leukemia" },
  { icd10Code: "C71.9", label: "Medulloblastoma", category: "cns_tumor" },
  { icd10Code: "C71.6", label: "Diffuse Intrinsic Pontine Glioma", category: "cns_tumor" },
  { icd10Code: "C81.90", label: "Hodgkin Lymphoma", category: "lymphoma" },
  { icd10Code: "C83.30", label: "Diffuse Large B-Cell Lymphoma", category: "lymphoma" },
  { icd10Code: "C74.90", label: "Neuroblastoma", category: "neuroblastoma" },
  { icd10Code: "C40.20", label: "Osteosarcoma", category: "bone_tumor" },
  { icd10Code: "C41.9", label: "Ewing Sarcoma", category: "bone_tumor" },
  { icd10Code: "C64.9", label: "Wilms Tumor", category: "renal_tumor" },
  { icd10Code: "C49.9", label: "Rhabdomyosarcoma", category: "soft_tissue_sarcoma" },
];

export const PROTOCOLS_BY_CATEGORY: Record<CancerCategory, string[]> = {
  leukemia: ["COG AALL0932", "COG AALL1131", "SJCRH Total Therapy XVII"],
  cns_tumor: ["COG ACNS0331", "SJCRH SJMB12"],
  lymphoma: ["COG AHOD1331", "COG ANHL1131"],
  neuroblastoma: ["COG ANBL0532", "COG ANBL1531"],
  bone_tumor: ["COG AOST0331", "COG AEWS1031"],
  renal_tumor: ["COG AREN0532"],
  soft_tissue_sarcoma: ["COG ARST1431"],
};

export const DRUGS_BY_CATEGORY: Record<CancerCategory, string[]> = {
  leukemia: ["vincristine", "dexamethasone", "pegaspargase", "methotrexate"],
  cns_tumor: ["cisplatin", "vincristine", "cyclophosphamide"],
  lymphoma: ["doxorubicin", "bleomycin", "vinblastine", "dacarbazine"],
  neuroblastoma: ["cisplatin", "etoposide", "cyclophosphamide", "doxorubicin"],
  bone_tumor: ["methotrexate", "doxorubicin", "cisplatin", "ifosfamide"],
  renal_tumor: ["vincristine", "dactinomycin", "doxorubicin"],
  soft_tissue_sarcoma: ["vincristine", "dactinomycin", "cyclophosphamide"],
};

export const TREATMENT_TYPES = [
  "chemotherapy",
  "radiation",
  "surgery",
  "transplant",
  "immunotherapy",
] as const;

export const RACE_CATEGORIES = [
  "White",
  "Black or African American",
  "Asian",
  "American Indian or Alaska Native",
  "Native Hawaiian or Other Pacific Islander",
  "Multiple races",
];

export const RISK_GROUPS = ["low", "standard", "high", "very_high"] as const;
