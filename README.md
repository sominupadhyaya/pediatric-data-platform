# Pediatric Data Platform

A synthetic, de-identified pediatric oncology cohort platform: a MongoDB data
model inspired by FHIR resources (Patient / Condition / MedicationRequest /
Observation), an Express + TypeScript cohort/analytics API, and a React
dashboard on top.

**All data is synthetic** (generated with `@faker-js/faker`), not real
patient data. The schema is deliberately built the way a de-identified
research dataset would be: HIPAA Safe Harbor style — no names, no MRNs, no
exact dates (only diagnosis *year* and day-*offsets* from diagnosis), ages
capped at 19, synthetic UUIDs as patient identifiers.

## Why this project

Places like St. Jude run research on large de-identified cohorts drawn from
clinical data systems (see St. Jude Cloud). This project is a small-scale
stand-in for that pattern: ingest structured clinical records, model them
close to a healthcare interoperability standard (FHIR), and expose
cohort-building + outcomes-analytics queries via aggregation pipelines.

## Structure

```
src/
  models/        Mongoose schemas (Patient, Condition, TreatmentCourse, Observation)
  seed/          Synthetic data generator (reference tables + generator script)
  services/      Aggregation-pipeline queries (cohort builder, survival/outcomes)
  routes/        Express routes (/api/cohorts, /api/analytics)
  index.ts       App entrypoint
client/          React + Vite + TS dashboard (recharts)
```

## Running it

Requires a local MongoDB (`mongod`).

```bash
cp .env.example .env
npm install
npm run seed      # generates synthetic patients (SEED_PATIENT_COUNT env var, default 500)
npm start         # API on http://localhost:5060
```

Frontend:

```bash
cd client
cp .env.example .env
npm install
npm run dev       # dashboard on http://localhost:5173
```

## API

- `GET /api/analytics/survival-by-diagnosis` — survival rate + avg survival months, grouped by cancer category and risk group
- `GET /api/analytics/outcomes-by-protocol` — complete-remission rate grouped by treatment protocol
- `GET /api/analytics/demographics` — patient counts by race/sex
- `GET /api/cohorts?cancerCategory=&riskGroup=&sex=&ageMin=&ageMax=&page=` — paginated cohort query
- `GET /api/cohorts/:patientId` — full de-identified record for one patient (condition, treatment courses, observations)

## Notes on de-identification

- No direct identifiers (name, MRN, address, phone, exact DOB) are ever stored.
- Dates are represented as `diagnosisYear` (year only) and `*OffsetDays` (days
  since diagnosis) rather than absolute calendar dates.
- Ages are capped at 19 per Safe Harbor's "age 90+" analog for this pediatric context.
- `patientId` is a randomly generated UUID, not derived from any real identifier.

This is a portfolio/demo project — reference values (protocols, drug names,
ICD-10 codes) are illustrative and simplified, not a clinical source of truth.
