import type { ConsultationRecord } from '@/lib/mockData';

interface ActivityListProps {
  consultations: ConsultationRecord[];
}

export default function ActivityList({ consultations }: ActivityListProps) {
  if (consultations.length === 0) {
    return (
      <div className="activity-item">
        <div className="activity-content">
          <div className="activity-desc">No recent consultations</div>
        </div>
      </div>
    );
  }

  return (
    <ul className="activity-list">
      {consultations.map((consultation) => (
        <li key={consultation.id} className="activity-item">
          <div className="activity-icon note">📄</div>
          <div className="activity-content">
            <div className="activity-title">{consultation.patientName}</div>
            <div className="activity-desc">{consultation.summary}</div>
          </div>
          <div className="activity-time">
            {new Date(consultation.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
