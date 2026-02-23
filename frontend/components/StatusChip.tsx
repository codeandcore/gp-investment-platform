import { cn } from '@/lib/utils';

type StatusType =
  | 'started'
  | 'submitted'
  | 'qualified'
  | 'not_qualified'
  | 'attending_raise'
  | 'opted_in'
  | 'not_opted_in'
  | string;

const STATUS_STYLES: Record<string, string> = {
  started: 'bg-gray-100 text-gray-700 border-gray-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  qualified: 'bg-green-50 text-green-700 border-green-200',
  not_qualified: 'bg-red-50 text-red-700 border-red-200',
  attending_raise: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  opted_in: 'bg-green-50 text-green-700 border-green-200',
  not_opted_in: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  started: 'Started',
  submitted: 'Submitted',
  qualified: 'Qualified',
  not_qualified: 'Not Qualified',
  attending_raise: 'Attending Raise',
  opted_in: 'Opted In',
  not_opted_in: 'Not Opted In',
};

interface StatusChipProps {
  status: StatusType;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
