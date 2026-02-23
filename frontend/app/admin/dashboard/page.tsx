'use client';

import { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, Database, TrendingUp, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { applicationsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface StatsCard {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function StatCard({ label, value, change, positive, icon: Icon, iconBg, iconColor }: StatsCard) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-medium mt-1.5 px-2 py-0.5 rounded-full',
                positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              )}
            >
              {change}
            </span>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}

interface AppStats {
  total: number;
  submitted: number;
  qualified: number;
  optedIn: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch counts using the list endpoint with limit=1 to get totals
        const [all, submitted, qualified, optedIn] = await Promise.all([
          applicationsApi.list({ limit: 1 }),
          applicationsApi.list({ applicantProgressStatus: 'submitted', limit: 1 }),
          applicationsApi.list({ adminQualificationStatus: 'qualified', limit: 1 }),
          applicationsApi.list({ databaseStatus: 'opted_in', limit: 1 }),
        ]);
        setStats({
          total: all.data.total ?? 0,
          submitted: submitted.data.total ?? 0,
          qualified: qualified.data.total ?? 0,
          optedIn: optedIn.data.total ?? 0,
        });
      } catch {
        // Use placeholder data if API not yet connected
        setStats({ total: 1284, submitted: 842, qualified: 442, optedIn: 1002 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const res = await applicationsApi.exportCsv();
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gp-applications-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handle error
    }
  };

  const statCards: StatsCard[] = [
    {
      label: 'Total Applications',
      value: loading ? '—' : (stats?.total ?? 0).toLocaleString(),
      change: '+12%',
      positive: true,
      icon: FileText,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Qualified GPs',
      value: loading ? '—' : (stats?.qualified ?? 0).toLocaleString(),
      change: '+8.2%',
      positive: true,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Awaiting Review',
      value: loading ? '—' : (stats?.submitted ?? 0).toLocaleString(),
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Database Opt-In',
      value: loading ? '—' : (stats?.optedIn ?? 0).toLocaleString(),
      icon: Database,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Analytics Dashboard" subtitle="Overview · Pipeline Performance">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Application Status summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Application Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Qualified', count: stats?.qualified ?? 835, color: 'bg-indigo-500', pct: 65 },
              { label: 'Pending', count: Math.round((stats?.total ?? 0) - (stats?.qualified ?? 0)), color: 'bg-amber-400', pct: 22 },
              { label: 'Not Qualified', count: 154, color: 'bg-red-400', pct: 13 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Pending — Stage-wise Progress</h2>
          <p className="text-xs text-gray-400 mb-4">Applications flow at active sending confidence</p>
          <div className="space-y-4">
            {[
              { label: 'Started Applications', value: stats?.total ?? 442, max: 500 },
              { label: 'Profile Complete', value: stats?.submitted ?? 205, max: 500 },
              { label: 'Assets Uploaded', value: 100, max: 500 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600 text-xs">{i + 1}. {item.label}</span>
                  <span className="font-semibold text-gray-900 text-xs">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Opt-in */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Database Opt-in</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 38 * 0.78} ${2 * Math.PI * 38 * 0.22}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">78%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-600">Opted in</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {(stats?.optedIn ?? 1002).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <span className="text-xs text-gray-600">Not opted</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">292</span>
            </div>
          </div>
          <button className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-wide">
            <TrendingUp className="h-3 w-3" /> Manage Lists
          </button>
        </div>
      </div>
    </div>
  );
}
