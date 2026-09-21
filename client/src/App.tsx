import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchSurvivalByDiagnosis,
  fetchOutcomesByProtocol,
  fetchDemographics,
  fetchCohort,
  type SurvivalRow,
  type ProtocolOutcomeRow,
  type DemographicsRow,
} from "./api";
import "./App.css";

const RISK_COLORS: Record<string, string> = {
  low: "#4caf7d",
  standard: "#4c8bf5",
  high: "#f5a623",
  very_high: "#e5484d",
};

function useAsync<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error };
}

function App() {
  const survival = useAsync<SurvivalRow[]>(fetchSurvivalByDiagnosis);
  const protocols = useAsync<ProtocolOutcomeRow[]>(fetchOutcomesByProtocol);
  const demographics = useAsync<DemographicsRow[]>(fetchDemographics);

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [cohortTotal, setCohortTotal] = useState<number | null>(null);

  useEffect(() => {
    fetchCohort({ cancerCategory: categoryFilter || undefined })
      .then((res) => setCohortTotal(res.total))
      .catch(() => setCohortTotal(null));
  }, [categoryFilter]);

  const categories = Array.from(new Set(survival.data?.map((r) => r.cancerCategory) ?? []));
  const loadError = survival.error || protocols.error || demographics.error;

  return (
    <div className="dashboard">
      <header>
        <h1>Pediatric Oncology Cohort Dashboard</h1>
        <p className="subtitle">
          Synthetic, de-identified data for demo purposes only — modeled on FHIR resource shapes.
        </p>
      </header>

      {loadError && (
        <div className="banner error">
          Could not reach the API. Is the backend running and seeded? ({loadError})
        </div>
      )}

      <section className="card">
        <h2>Survival Rate by Diagnosis &amp; Risk Group</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={survival.data ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cancerCategory" tick={{ fontSize: 12 }} />
            <YAxis unit="%" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="survivalRatePct" name="Survival rate (%)">
              {(survival.data ?? []).map((row, i) => (
                <Cell key={i} fill={RISK_COLORS[row.riskGroup] ?? "#8884d8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h2>Remission Rate by Treatment Protocol</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={protocols.data ?? []} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" domain={[0, 100]} />
            <YAxis type="category" dataKey="protocolName" tick={{ fontSize: 12 }} width={160} />
            <Tooltip />
            <Bar dataKey="remissionRatePct" name="Complete remission (%)" fill="#4c8bf5" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h2>Cohort Builder</h2>
        <label>
          Cancer category:&nbsp;
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <p className="cohort-count">
          {cohortTotal === null ? "Loading..." : `${cohortTotal} matching patients`}
        </p>
      </section>

      <section className="card">
        <h2>Demographics</h2>
        <table>
          <thead>
            <tr>
              <th>Race</th>
              <th>Sex</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {(demographics.data ?? []).map((row, i) => (
              <tr key={i}>
                <td>{row.race}</td>
                <td>{row.sex}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
