import Link from 'next/link';

interface QuickAction {
  href: string;
  icon: string;
  label: string;
}

const actions: QuickAction[] = [
  { href: '/consultation', icon: '🎙️', label: 'Start Consultation' },
  { href: '/patients', icon: '➕', label: 'Add Patient' },
  { href: '/patients', icon: '🔍', label: 'Search Records' },
  { href: '/consultation', icon: '📊', label: 'View Reports' },
];

export default function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="quick-action">
          <div className="quick-action-icon">{action.icon}</div>
          <div className="quick-action-label">{action.label}</div>
        </Link>
      ))}
    </div>
  );
}
