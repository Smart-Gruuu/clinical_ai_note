'use client';

import Link from 'next/link';
import { Button } from '../ui';
import { StatusBadge } from '../ui/Badge';
import type { Patient } from '@/lib/mockData';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

export default function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
        <p>No patients found matching your criteria</p>
      </div>
    );
  }

  return (
    <table className="patient-table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Contact</th>
          <th>Age / Gender</th>
          <th>Last Visit</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.id}>
            <td>
              <div className="patient-name">{patient.name}</div>
              <div className="patient-id">{patient.id}</div>
            </td>
            <td className="patient-meta">
              <div>{patient.phone || '—'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {patient.email || '—'}
              </div>
            </td>
            <td className="patient-meta">
              {patient.age} yrs /{' '}
              {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}
            </td>
            <td className="patient-meta">
              {patient.lastVisit
                ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </td>
            <td>
              <StatusBadge status={patient.status} />
            </td>
            <td>
              <div className="patient-actions">
                <Link href={`/consultation?patient=${patient.id}`}>
                  <Button variant="primary" size="sm">
                    Start Visit
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => onEdit(patient)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(patient.id)}>
                  🗑️
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
