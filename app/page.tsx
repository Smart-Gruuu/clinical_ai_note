'use client';

import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/layout';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { StatCard, ActivityList, QuickActions, RecentPatientsTable } from '@/components/dashboard';
import { getDashboardStats, getRecentConsultations, getActivePatients } from '@/lib/mockData';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const recentConsultations = getRecentConsultations();
  const recentPatients = getActivePatients().slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        title="Welcome back, Dr. Smith"
        subtitle="Here's what's happening with your practice today"
        actions={
          <Link href="/consultation">
            <Button variant="primary">
              <span>🎙️</span> New Consultation
            </Button>
          </Link>
        }
      />

      <div className="page-body">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            icon="👥"
            iconType="patients"
            value={stats.activePatients}
            label="Active Patients"
            change="↑ 2 this month"
            changeType="positive"
          />
          <StatCard
            icon="📋"
            iconType="consultations"
            value={stats.consultationsThisMonth}
            label="Consultations"
            change="This month"
            changeType="positive"
          />
          <StatCard
            icon="📝"
            iconType="pending"
            value={stats.pendingNotes}
            label="Pending Notes"
            change="To complete"
          />
          <StatCard
            icon="💡"
            iconType="insights"
            value={stats.insightsGenerated}
            label="Insights Generated"
            change="This week"
            changeType="positive"
          />
        </div>

        {/* Main Content Row */}
        <div className="dashboard-row">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Your latest patient interactions">
                Recent Consultations
              </CardTitle>
              <Link href="/consultation">
                <Button variant="secondary" size="sm">View all</Button>
              </Link>
            </CardHeader>
            <ActivityList consultations={recentConsultations} />
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Common tasks at your fingertips">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <QuickActions />
          </Card>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Patients you've seen recently">
              Recent Patients
            </CardTitle>
            <Link href="/patients">
              <Button variant="secondary" size="sm">View all patients</Button>
            </Link>
          </CardHeader>
          <RecentPatientsTable patients={recentPatients} />
        </Card>
      </div>
    </AppShell>
  );
}
