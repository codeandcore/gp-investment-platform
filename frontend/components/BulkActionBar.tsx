'use client';

import { Bell, Send, UserCog, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onSendReminder: () => void;
  onSendOptIn: () => void;
  onChangeOwner: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  onSendReminder,
  onSendOptIn,
  onChangeOwner,
  onExport,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-2 pr-3 border-r border-white/20">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </div>
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount === 1 ? 'Application' : 'Applications'} Selected
        </span>
      </div>

      <button
        onClick={onSendReminder}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Send Reminder</span>
      </button>

      <button
        onClick={onSendOptIn}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Send Opt-In Nudge</span>
      </button>

      <button
        onClick={onChangeOwner}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
      >
        <UserCog className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Change Owner</span>
      </button>

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button
        onClick={onClear}
        className="ml-1 p-1 hover:bg-white/10 rounded-lg transition-colors"
        title="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
