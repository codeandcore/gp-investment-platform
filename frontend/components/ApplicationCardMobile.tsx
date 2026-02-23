'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Bell, Send } from 'lucide-react';
import { StatusChip } from '@/components/StatusChip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/utils';
import type { ApplicationRow } from '@/components/ApplicationsTable';

interface ApplicationCardMobileProps {
  app: ApplicationRow;
  onAction: (action: string, id: string) => void;
}

export function ApplicationCardMobile({ app, onAction }: ApplicationCardMobileProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-xs">
              {app.companyName?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{app.companyName}</p>
            <p className="text-xs text-gray-400 font-mono">{app.uniqueId}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push(`/admin/applications/${app._id}`)}>
              <Eye className="h-4 w-4" /> View Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('qualified', app._id)}>
              <CheckCircle className="h-4 w-4 text-green-500" /> Mark Qualified
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('not_qualified', app._id)}>
              <XCircle className="h-4 w-4 text-red-500" /> Mark Not Qualified
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('reminder', app._id)}>
              <Bell className="h-4 w-4" /> Send Reminder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('opt_in', app._id)}>
              <Send className="h-4 w-4" /> Send Opt-In Nudge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contact */}
      <p className="text-sm text-gray-700 mb-3">
        {app.primaryContactFirstName} {app.primaryContactLastName}
        {app.primaryContactEmail && (
          <span className="text-xs text-gray-400 ml-1">· {app.primaryContactEmail}</span>
        )}
      </p>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {app.applicantProgressStatus && <StatusChip status={app.applicantProgressStatus} />}
        {app.adminQualificationStatus && <StatusChip status={app.adminQualificationStatus} />}
        {app.databaseStatus && <StatusChip status={app.databaseStatus} />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{formatDateTime(app.lastActivityAt)}</span>
        <button
          onClick={() => router.push(`/admin/applications/${app._id}`)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          View →
        </button>
      </div>
    </div>
  );
}
