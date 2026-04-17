type BadgeVariant = 'high' | 'medium' | 'low' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClass = variant === 'default' ? '' : `badge-${variant}`;
  return <span className={`badge ${variantClass} ${className}`.trim()}>{children}</span>;
}

interface StatusBadgeProps {
  status: 'active' | 'inactive';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}
