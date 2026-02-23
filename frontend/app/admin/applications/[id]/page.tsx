'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Download,
  Share2,
  Loader2,
  FileText,
  Link2,
  Mail,
  Globe,
  User,
  RefreshCw,
} from 'lucide-react';
import { StatusChip } from '@/components/StatusChip';
import { AdminActionPanel } from '@/components/AdminActionPanel';
import { Timeline } from '@/components/Timeline';
import { AuditLog } from '@/components/AuditLog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { applicationsApi } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationDetail {
  _id: string;
  uniqueId: string;
  companyName: string;
  applicantProgressStatus: string;
  adminQualificationStatus?: string;
  databaseStatus?: string;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactEmail?: string;
  primaryContactLinkedIn?: string;
  primaryContactTitle?: string;
  headshot?: string;
  previousOwner?: { name?: string; email: string };
  assignedAt?: string;
  documents?: {
    deckUrl?: string;
    logoUrl?: string;
    headShotUrl?: string;
    supplementalLinks?: string[];
  };
  step1?: Record<string, unknown>;
  step2?: Record<string, unknown>;
  step3?: Record<string, unknown>;
  internalNotes?: { note: string; addedBy?: { name?: string }; addedAt: string }[];
  lastActivityAt?: string;
  assignedOwner?: { _id: string; name?: string; email: string };
}

interface AuditEntry {
  _id: string;
  action: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy?: { name?: string; email: string } | null;
  createdAt: string;
}

interface TimelineEvent {
  _id: string;
  eventType: string;
  description: string;
  createdAt: string;
  userId?: { name?: string; email: string } | null;
}

// ─── Helper: render a questionnaire section ───────────────────────────────────

function QuestionSection({
  stepNum,
  title,
  data,
}: {
  stepNum: number;
  title: string;
  data?: Record<string, unknown>;
}) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <AccordionItem value={`step-${stepNum}`}>
      <AccordionTrigger>{stepNum}. {title}</AccordionTrigger>
      <AccordionContent>
        <dl className="space-y-4">
          {Object.entries(data).map(([k, v]) => {
            if (v === undefined || v === null || v === '') return null;
            const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
            return (
              <div key={k}>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {label}
                </dt>
                <dd className="text-sm text-gray-800">
                  {Array.isArray(v) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {v.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {String(item)}
                        </span>
                      ))}
                    </div>
                  ) : typeof v === 'object' ? (
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(v, null, 2)}
                    </pre>
                  ) : (
                    <p className="leading-relaxed">{String(v)}</p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');

  const fetchDetail = async () => {
    try {
      const [detailRes, auditRes] = await Promise.all([
        applicationsApi.getDetail(id),
        applicationsApi.getAuditLog(id),
      ]);
      setApp(detailRes.data.application);
      setAuditLog(auditRes.data.entries ?? []);
      setTimeline(detailRes.data.application?.activityLog ?? []);
    } catch {
      toast.error('Failed to load application detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-32 text-gray-400">
        Application not found.{' '}
        <Link href="/admin/applications" className="text-indigo-600 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const contactName = `${app.primaryContactFirstName ?? ''} ${app.primaryContactLastName ?? ''}`.trim();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/applications" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <span>/</span>
        <span>Applications</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{app.companyName}</span>
      </div>

      {/* Company header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{app.companyName}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                {app.uniqueId}
              </span>
              {app.applicantProgressStatus && (
                <StatusChip status={app.applicantProgressStatus} />
              )}
              {app.adminQualificationStatus && (
                <StatusChip status={app.adminQualificationStatus} />
              )}
              {app.databaseStatus && (
                <StatusChip status={app.databaseStatus} />
              )}
              {/* Sync badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                <RefreshCw className="h-3 w-3" />
                Sync With GP Portal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Primary Contact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Primary Contact Details</h2>
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                {app.documents?.headShotUrl ? (
                  <AvatarImage src={app.documents.headShotUrl} alt={contactName} />
                ) : null}
                <AvatarFallback className="text-base">
                  {contactName ? contactName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'GP'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {app.primaryContactTitle && (
                  <p className="text-xs text-gray-400 mb-0.5">{app.primaryContactTitle}</p>
                )}
                <p className="font-semibold text-gray-900 text-base">{contactName || '—'}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {app.primaryContactEmail && (
                    <a
                      href={`mailto:${app.primaryContactEmail}`}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {app.primaryContactEmail}
                    </a>
                  )}
                  {app.primaryContactLinkedIn && (
                    <a
                      href={app.primaryContactLinkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            {(app.previousOwner) && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Previous owner:{' '}
                  <span className="font-medium text-gray-700">
                    {app.previousOwner.name ?? app.previousOwner.email}
                  </span>
                  {app.assignedAt && (
                    <span className="text-gray-400"> · Assigned on {formatDate(app.assignedAt)}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Pitch Deck & Links */}
          <div className="flex gap-3">
            {app.documents?.deckUrl && (
              <a
                href={app.documents.deckUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
              >
                <FileText className="h-4 w-4" />
                View Pitch Deck
              </a>
            )}
            {app.documents?.supplementalLinks?.length ? (
              <a
                href={app.documents.supplementalLinks[0]}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <Link2 className="h-4 w-4" />
                Supplemental Links
              </a>
            ) : null}
          </div>

          {/* Application Questionnaire */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Application Questionnaire</h2>
            <Accordion type="multiple" defaultValue={['step-1']}>
              <QuestionSection stepNum={1} title="Investment Strategy & Thesis" data={app.step1 as Record<string, unknown>} />
              <QuestionSection stepNum={2} title="Team Composition" data={app.step2 as Record<string, unknown>} />
              <QuestionSection stepNum={3} title="Historical Performance & Track Record" data={app.step3 as Record<string, unknown>} />
            </Accordion>
          </div>

          {/* Assets & Documents */}
          {(app.documents?.deckUrl || app.documents?.logoUrl || app.documents?.headShotUrl) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Assets & Documents</h2>
                <span className="text-xs text-gray-400">
                  {[app.documents.deckUrl, app.documents.logoUrl, app.documents.headShotUrl].filter(Boolean).length} Files Uploaded
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {app.documents.deckUrl && (
                  <a
                    href={app.documents.deckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <FileText className="h-8 w-8 text-red-500 group-hover:text-indigo-600 transition-colors" />
                    <p className="text-xs text-gray-600 font-medium text-center truncate w-full">
                      Pitch Deck
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(app.lastActivityAt)}
                    </p>
                  </a>
                )}
                {app.documents.logoUrl && (
                  <a
                    href={app.documents.logoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.documents.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Company Logo</p>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <Timeline events={timeline} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Admin Actions */}
          <AdminActionPanel
            applicationId={app._id}
            currentQualificationStatus={app.adminQualificationStatus}
            currentOwner={app.assignedOwner}
            onRefresh={fetchDetail}
          />

          {/* Audit Log */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Audit Log</h2>
            <AuditLog
              entries={auditLog}
              maxItems={5}
              onViewAll={() => setActiveTab('audit')}
            />
          </div>

          {/* Internal Notes */}
          {app.internalNotes && app.internalNotes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Notes History</h2>
              <div className="space-y-3">
                {app.internalNotes.map((n, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-sm text-gray-800">{n.note}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {n.addedBy?.name ?? 'Admin'} · {formatDateTime(n.addedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 pb-2 flex items-center justify-between text-xs text-gray-400">
        <span>© 2013 GP Admin Management Portal</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600">Security Audit</a>
          <a href="#" className="hover:text-gray-600">Support</a>
        </div>
      </div>
    </div>
  );
}
