type StatIconType = 'patients' | 'consultations' | 'pending' | 'insights';

interface StatCardProps {
  icon: string;
  iconType: StatIconType;
  value: number | string;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function StatCard({
  icon,
  iconType,
  value,
  label,
  change,
  changeType = 'neutral',
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconType}`}>{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && (
          <div className={`stat-change ${changeType}`}>{change}</div>
        )}
      </div>
    </div>
  );
}
