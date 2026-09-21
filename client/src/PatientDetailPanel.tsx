import { useEffect, useState } from "react";
import { fetchPatientDetail, type PatientDetail } from "./api";

interface Props {
  patientId: string;
  onClose: () => void;
}

export default function PatientDetailPanel({ patientId, onClose }: Props) {
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    setError(null);
    fetchPatientDetail(patientId)
      .then(setDetail)
      .catch((err) => setError(err.message ?? "Failed to load patient"));
  }, [patientId]);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          Close
        </button>

        {error && <div className="banner error">{error}</div>}
        {!detail && !error && <p>Loading...</p>}

        {detail && (
          <>
            <h2>{detail.condition?.diagnosisLabel ?? "Patient"}</h2>
            <dl className="detail-grid">
              <dt>Patient ID</dt>
              <dd>{detail.patient.patientId}</dd>
              <dt>Sex</dt>
              <dd>{detail.patient.sex}</dd>
              <dt>Race</dt>
              <dd>{detail.patient.race}</dd>
              <dt>Age at diagnosis</dt>
              <dd>{detail.patient.ageAtDiagnosis}</dd>
              <dt>Diagnosis year</dt>
              <dd>{detail.patient.diagnosisYear}</dd>
              <dt>Risk group</dt>
              <dd>{detail.condition?.riskGroup}</dd>
              <dt>Stage</dt>
              <dd>{detail.condition?.stage}</dd>
              <dt>Vital status</dt>
              <dd>{detail.patient.vitalStatus}</dd>
              <dt>Survival (months)</dt>
              <dd>{detail.patient.survivalMonths}</dd>
            </dl>

            <h3>Treatment courses</h3>
            <table>
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Type</th>
                  <th>Drugs</th>
                  <th>Start (day)</th>
                  <th>Duration (days)</th>
                </tr>
              </thead>
              <tbody>
                {detail.treatments.map((t, i) => (
                  <tr key={i}>
                    <td>{t.protocolName}</td>
                    <td>{t.treatmentType}</td>
                    <td>{t.regimenDrugs.join(", ")}</td>
                    <td>{t.startOffsetDays}</td>
                    <td>{t.durationDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Observations</h3>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Value</th>
                  <th>Day offset</th>
                </tr>
              </thead>
              <tbody>
                {detail.observations.map((o, i) => (
                  <tr key={i}>
                    <td>{o.code}</td>
                    <td>{o.valueString ?? o.valueNumber}</td>
                    <td>{o.timepointOffsetDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
