'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Multi-select Dropdown ────────────────────────────────────────────────────

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  };

  const displayLabel =
    selected.length === 0
      ? label
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 text-sm rounded-lg border bg-white transition-all',
            selected.length > 0
              ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          )}
        >
          <span className="max-w-[120px] truncate">{displayLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-0.5">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(opt.value)}
                onCheckedChange={() => toggle(opt.value)}
                id={`ms-${opt.value}`}
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

interface DateRangeProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangeProps) {
  const [open, setOpen] = useState(false);
  const hasValue = from || to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 text-sm rounded-lg border bg-white transition-all',
            hasValue
              ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
          <span>
            {hasValue
              ? `${from ? format(new Date(from), 'MMM d') : '—'} → ${to ? format(new Date(to), 'MMM d') : '—'}`
              : 'Last Activity'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Activity Range</p>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="w-full h-8 px-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="w-full h-8 px-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(from || to) && (
            <button
              onClick={() => { onFromChange(''); onToChange(''); }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear dates
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Filter Options ───────────────────────────────────────────────────────────

const PROGRESS_OPTIONS = [
  { value: 'started', label: 'Started' },
  { value: 'submitted', label: 'Submitted' },
];

const QUALIFICATION_OPTIONS = [
  { value: 'qualified', label: 'Qualified' },
  { value: 'not_qualified', label: 'Not Qualified' },
  { value: 'attending_raise', label: 'Attending Raise' },
];

const DATABASE_OPTIONS = [
  { value: 'opted_in', label: 'Opted In' },
  { value: 'not_opted_in', label: 'Not Opted In' },
];

const DECK_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface FilterState {
  progressStatus: string[];
  qualificationStatus: string[];
  databaseStatus: string[];
  deckUploaded: string[];
  dateFrom: string;
  dateTo: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const hasAnyFilter =
    filters.progressStatus.length > 0 ||
    filters.qualificationStatus.length > 0 ||
    filters.databaseStatus.length > 0 ||
    filters.deckUploaded.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  const clearAll = () =>
    onChange({
      progressStatus: [],
      qualificationStatus: [],
      databaseStatus: [],
      deckUploaded: [],
      dateFrom: '',
      dateTo: '',
    });

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      <MultiSelect
        label="Applicant Progress"
        options={PROGRESS_OPTIONS}
        selected={filters.progressStatus}
        onChange={(v) => set('progressStatus', v)}
      />
      <MultiSelect
        label="Admin Qualification"
        options={QUALIFICATION_OPTIONS}
        selected={filters.qualificationStatus}
        onChange={(v) => set('qualificationStatus', v)}
      />
      <MultiSelect
        label="Database Status"
        options={DATABASE_OPTIONS}
        selected={filters.databaseStatus}
        onChange={(v) => set('databaseStatus', v)}
      />
      <MultiSelect
        label="Deck"
        options={DECK_OPTIONS}
        selected={filters.deckUploaded}
        onChange={(v) => set('deckUploaded', v)}
      />
      <DateRangePicker
        from={filters.dateFrom}
        to={filters.dateTo}
        onFromChange={(v) => set('dateFrom', v)}
        onToChange={(v) => set('dateTo', v)}
      />
      {hasAnyFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors ml-1"
        >
          <X className="h-3 w-3" /> Clear all
        </button>
      )}
    </div>
  );
}
