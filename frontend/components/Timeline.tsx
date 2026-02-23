import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CheckCircle, Mail, Edit3, Upload, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  _id: string;
  eventType: string;
  description: string;
  createdAt: string;
  userId?: { name?: string; email: string } | null;
}

const EVENT_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  APPLICATION_SUBMITTED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  EMAIL_SENT: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
  STEP_SAVED: { icon: Edit3, color: 'text-gray-500', bg: 'bg-gray-100' },
  FILE_UPLOADED: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-50' },
  DEFAULT: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100' },
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" aria-hidden="true" />

      <ul className="space-y-5">
        {events.map((ev, idx) => {
          const def = EVENT_ICON[ev.eventType] ?? EVENT_ICON.DEFAULT;
          const Icon = def.icon;
          return (
            <li key={ev._id ?? idx} className="relative flex gap-4 pl-10">
              <span
                className={cn(
                  'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white',
                  def.bg
                )}
              >
                <Icon className={cn('h-4 w-4', def.color)} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{ev.description}</p>
                {ev.userId && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ev.userId.name ?? ev.userId.email}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ev.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
