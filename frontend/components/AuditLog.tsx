import { formatDateTime } from '@/lib/utils';
import { User2 } from 'lucide-react';

interface AuditEntry {
  _id: string;
  action: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy?: { name?: string; email: string } | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  QUALIFICATION_STATUS_CHANGED: 'changed qualification status',
  DATABASE_STATUS_CHANGED: 'changed database status',
  OWNER_CHANGED: 'changed owner',
  NOTE_ADDED: 'added a note',
  APPLICATION_SUBMITTED: 'submitted the application',
  FILE_UPLOADED: 'uploaded a file',
};

interface AuditLogProps {
  entries: AuditEntry[];
  onViewAll?: () => void;
  maxItems?: number;
}

export function AuditLog({ entries, onViewAll, maxItems = 5 }: AuditLogProps) {
  const shown = entries.slice(0, maxItems);

  if (!shown.length) {
    return <p className="text-sm text-gray-400 text-center py-6">No audit log entries</p>;
  }

  return (
    <div className="space-y-3">
      {shown.map((entry) => {
        const actor = entry.performedBy?.name ?? entry.performedBy?.email ?? 'System';
        const action = ACTION_LABELS[entry.action] ?? entry.action.toLowerCase().replace(/_/g, ' ');
        const toVal = entry.newValue ? Object.values(entry.newValue)[0] : null;

        return (
          <div key={entry._id} className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User2 className="h-3 w-3 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{actor}</span>{' '}
                {action}
                {toVal ? (
                  <span className="font-medium text-indigo-600"> → {String(toVal)}</span>
                ) : null}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.createdAt)}</p>
            </div>
          </div>
        );
      })}
      {entries.length > maxItems && onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 uppercase tracking-wide"
        >
          View Full Audit History →
        </button>
      )}
    </div>
  );
}
