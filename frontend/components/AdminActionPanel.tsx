'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, UserCog, RefreshCw } from 'lucide-react';
import { applicationsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminActionPanelProps {
  applicationId: string;
  currentQualificationStatus?: string;
  currentOwner?: { _id: string; name?: string; email: string };
  note?: string;
  onRefresh: () => void;
}

const QUALIFICATION_OPTIONS = [
  { value: 'qualified', label: 'Qualified' },
  { value: 'not_qualified', label: 'Not Qualified' },
  { value: 'attending_raise', label: 'Attending Raise' },
];

export function AdminActionPanel({
  applicationId,
  currentQualificationStatus,
  currentOwner,
  onRefresh,
}: AdminActionPanelProps) {
  const [status, setStatus] = useState(currentQualificationStatus ?? '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifGP, setNotifGP] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (status) {
        await applicationsApi.updateQualificationStatus(applicationId, status);
      }
      if (note.trim()) {
        await applicationsApi.addNote(applicationId, note.trim());
        setNote('');
      }
      toast.success('Record updated');
      onRefresh();
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      await applicationsApi.bulkAction('send_reminder', [applicationId]);
      toast.success('Reminder sent');
    } catch {
      toast.error('Failed to send reminder');
    }
  };

  const handleSendOptIn = async () => {
    try {
      await applicationsApi.bulkAction('send_opt_in_nudge', [applicationId]);
      toast.success('Opt-in nudge sent');
    } catch {
      toast.error('Failed to send nudge');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
      {/* Qualification Status */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Qualification Status
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status…" />
          </SelectTrigger>
          <SelectContent>
            {QUALIFICATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assigned Owner */}
      {currentOwner && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Assigned Owner
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-700 text-xs font-semibold">
                  {(currentOwner.name ?? currentOwner.email).slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-800">{currentOwner.name ?? currentOwner.email}</span>
            </div>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <UserCog className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Internal Notes */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Internal Notes
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a private note for other admins…"
          className="text-sm min-h-[80px]"
        />
        <p className="text-xs text-gray-400 mt-1">Admins only; does not send to GP</p>
      </div>

      {/* Notify toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={notifGP}
          onChange={(e) => setNotifGP(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">Send notification email to GP</span>
      </label>

      {/* Update Record */}
      <Button className="w-full" onClick={handleUpdate} disabled={loading}>
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
        Update Record
      </Button>

      {/* Quick Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={handleSendReminder}>
          <Bell className="h-4 w-4" /> Send Reminder Email
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={handleSendOptIn}>
          <Send className="h-4 w-4" /> Send Opt-In Nudge
        </Button>
      </div>
    </div>
  );
}
