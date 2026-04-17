'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/consultation', label: 'New Consultation', icon: '🎙️' },
  { href: '/patients', label: 'Patients', icon: '👥' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">💚</div>
          <div className="logo-text">
            Clinical<span>AI</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Quick Access</div>
          <Link href="/consultation" className="nav-item">
            <span className="nav-item-icon">📝</span>
            Recent Notes
          </Link>
          <Link href="/patients" className="nav-item">
            <span className="nav-item-icon">📅</span>
            Schedule
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">DS</div>
          <div className="user-details">
            <div className="user-name">Dr. Smith</div>
            <div className="user-role">Primary Care</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
