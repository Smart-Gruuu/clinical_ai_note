'use client';

import type { PatientSummary } from '@/lib/mockClinical';

interface PatientSummaryPanelProps {
  summary: PatientSummary;
}

export default function PatientSummaryPanel({ summary }: PatientSummaryPanelProps) {
  return (
    <div className="summary-panel">
      <h3>{summary.title}</h3>
      <p className="summary-intro">{summary.intro}</p>
      <ul className="summary-bullets">
        {summary.bullets.map((bullet, idx) => (
          <li key={idx}>{bullet}</li>
        ))}
      </ul>
      <p className="summary-hint">
        This is what your patient would see in their portal—simple and clear.
      </p>
    </div>
  );
}
