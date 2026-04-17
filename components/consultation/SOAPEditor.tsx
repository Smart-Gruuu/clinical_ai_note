'use client';

import type { SOAPNote } from '@/lib/mockClinical';

interface SOAPEditorProps {
  soap: SOAPNote;
  onChange: (field: keyof SOAPNote, value: string) => void;
}

export default function SOAPEditor({ soap, onChange }: SOAPEditorProps) {
  return (
    <div className="soap-editor">
      <div className="soap-section">
        <h3>Subjective</h3>
        <textarea
          value={soap.subjective}
          onChange={(e) => onChange('subjective', e.target.value)}
          aria-label="Subjective section"
        />
      </div>
      <div className="soap-section">
        <h3>Objective</h3>
        <textarea
          value={soap.objective}
          onChange={(e) => onChange('objective', e.target.value)}
          aria-label="Objective section"
        />
      </div>
      <div className="soap-section">
        <h3>Assessment</h3>
        <textarea
          value={soap.assessment}
          onChange={(e) => onChange('assessment', e.target.value)}
          aria-label="Assessment section"
        />
      </div>
      <div className="soap-section">
        <h3>Plan</h3>
        <textarea
          value={soap.plan}
          onChange={(e) => onChange('plan', e.target.value)}
          aria-label="Plan section"
        />
      </div>
      <p className="soap-hint">
        Review and edit the note above. When ready, approve to save to the patient&apos;s record.
      </p>
    </div>
  );
}
