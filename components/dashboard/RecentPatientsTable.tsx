import Link from 'next/link';
import { Button } from '../ui';
import { StatusBadge } from '../ui/Badge';
import type { Patient } from '@/lib/mockData';

interface RecentPatientsTableProps {
  patients: Patient[];
}

export default function RecentPatientsTable({ patients }: RecentPatientsTableProps) {
  return (
    <table className="patient-table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Age / Gender</th>
          <th>Last Visit</th>
          <th>Status</th>
          <th></th>
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
                  <Button variant="secondary" size="sm">
                    Start Visit
                  </Button>
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
