'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar, type FilterState } from '@/components/FilterBar';
import { ApplicationsTable, type ApplicationRow } from '@/components/ApplicationsTable';
import { ApplicationCardMobile } from '@/components/ApplicationCardMobile';
import { BulkActionBar } from '@/components/BulkActionBar';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ChangeOwnerModal } from '@/components/ChangeOwnerModal';
import { applicationsApi, type ApplicationFilters } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: FilterState = {
  progressStatus: [],
  qualificationStatus: [],
  databaseStatus: [],
  deckUploaded: [],
  dateFrom: '',
  dateTo: '',
};

export default function ApplicationsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<ApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkModal, setBulkModal] = useState<{ open: boolean; action: string; label: string }>({
    open: false,
    action: '',
    label: '',
  });
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerSelected, setOwnerSelected] = useState<{ id: string; name: string; role?: string; avatarUrl?: string } | null>(null);

  const limit = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: ApplicationFilters = {
        page,
        limit,
        search: search || undefined,
      };
      if (filters.progressStatus.length)
        params.applicantProgressStatus = filters.progressStatus;
      if (filters.qualificationStatus.length)
        params.adminQualificationStatus = filters.qualificationStatus;
      if (filters.databaseStatus.length)
        params.databaseStatus = filters.databaseStatus;
      if (filters.deckUploaded.length === 1)
        params.deckUploaded = filters.deckUploaded[0];
      if (filters.dateFrom) params.lastActivityFrom = filters.dateFrom;
      if (filters.dateTo) params.lastActivityTo = filters.dateTo;

      const res = await applicationsApi.list(params);
      setData(res.data.applications ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filters, search, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, search]);

  const handleExport = async () => {
    try {
      const params: ApplicationFilters = {};
      if (filters.progressStatus.length)
        params.applicantProgressStatus = filters.progressStatus;
      if (filters.qualificationStatus.length)
        params.adminQualificationStatus = filters.qualificationStatus;
      const res = await applicationsApi.exportCsv(params);
      downloadBlob(res.data as Blob, `gp-applications-${Date.now()}.csv`);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleBulkAction = (action: string, label: string) => {
    if (!selectedIds.length) return;
    setBulkModal({ open: true, action, label });
  };

  const executeBulkAction = async () => {
    try {
      await applicationsApi.bulkAction(bulkModal.action, selectedIds);
      toast.success(`${bulkModal.label} completed`);
      setSelectedIds([]);
      setBulkModal({ open: false, action: '', label: '' });
      fetchApplications();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const handleMobileAction = async (action: string, id: string) => {
    try {
      if (['qualified', 'not_qualified', 'attending_raise'].includes(action)) {
        await applicationsApi.updateQualificationStatus(id, action);
        toast.success('Status updated');
      } else if (action === 'reminder') {
        await applicationsApi.bulkAction('send_reminder', [id]);
        toast.success('Reminder sent');
      } else if (action === 'opt_in') {
        await applicationsApi.bulkAction('send_opt_in_nudge', [id]);
        toast.success('Opt-in nudge sent');
      }
      fetchApplications();
    } catch {
      toast.error('Action failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 h-16 rounded-xl flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-lg">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">GP Applications Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications…"
              className="pl-9 pr-3 py-2 bg-gray-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table (desktop/tablet) / Cards (mobile) */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <ApplicationsTable
              data={data}
              onSelectionChange={setSelectedIds}
              onRefresh={fetchApplications}
            />
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {data.length === 0 ? (
              <p className="text-center text-gray-400 py-16 text-sm">No applications found</p>
            ) : (
              data.map((app) => (
                <ApplicationCardMobile
                  key={app._id}
                  app={app}
                  onAction={handleMobileAction}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} results
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onSendReminder={() => handleBulkAction('send_reminder', 'Send Reminder')}
        onSendOptIn={() => handleBulkAction('send_opt_in_nudge', 'Send Opt-In Nudge')}
        onChangeOwner={() => setOwnerModalOpen(true)}
        onExport={handleExport}
        onClear={() => setSelectedIds([])}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={bulkModal.open}
        onOpenChange={(o) => setBulkModal((m) => ({ ...m, open: o }))}
        title={`${bulkModal.label}?`}
        description={`This will ${bulkModal.label.toLowerCase()} to ${selectedIds.length} selected application(s).`}
        confirmLabel={bulkModal.label}
        onConfirm={executeBulkAction}
      />

      <ChangeOwnerModal
        open={ownerModalOpen}
        onOpenChange={setOwnerModalOpen}
        currentOwner={{
          id: 'owner-1',
          name: 'Jane Smith',
          role: 'Senior Investment Associate',
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBYl3KO9x1KrhhmBTU5VcR2Ah2ty3jLXWYKagEPpdTdQCzvZyO1Ow1hRLabmNLQKlrrJY70SrZ9Sk2538Hwcze8I-846D88mEDGFMmUHkMZlhY7bFelAuZbKSqLgiS-UX788Kkjeqn2cRCsYoTzJ53-85MtGcRzHtrM4fY0aEPbiDH0vE0at7YGbExGeKGGWXTDXHzZp7eIGfWgtLte3Fm0vPaAi16no1lh0qx8rcc9H_2VWagQaleQus-zaQx15T8MVwgIzJ6PjRkd',
        }}
        team={[
          {
            id: 'm1',
            name: 'Michael Chen',
            role: 'Investment Manager',
            avatarUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDRnRFilfU-DyZv1lamWf-S9FqE6eX3FebKm7SX8GaQ2RgSHaUsfUzI4Ex2HvGAFy-7tco59hfPqG-rskz4D8NBzmd053J83vAMfEGLUDwVVaPO922G0IrxrYlBv0iL_mg8Ec2lW7Nr0_XmxFKTlq0YNf6L_QYnduUzGHx7rRyDoNDQF0cbHe0c2aaBKcNOc9NrZTrU8U_osYKQTtYd2a0-CmcuTbfAMAhH9aa1GM6AjtXVU3SY92_09pOi2J4TlAFxdwHCG0O2U_zD',
          },
          {
            id: 'm2',
            name: 'Sarah Williams',
            role: 'Managing Director',
            avatarUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAimG03sEJwy3VaO4Hlbr5ZbeIE99EWYW04L7PQ8eq02hsFXREw02o5j1_pNFmvXw7xDzw6cQemAFYsM-GXqBPglgW0HdoDUwFFjIF-WGot4227ugRsRDIDIoGcKsBo13vstGg9-q3ZVKB9SbbIGBeAcGBruWET1TqiYOOKdvb-alxnlbn3ocIl3-Iu4BwHOKSm6PnHf_glq3t_WmS5exdFzUAFNSaqlKIlf3iRFrYZnZzA3b0D2T0kIoBSP6u_Re9c5F6jyPCqD3Jl',
          },
          {
            id: 'm3',
            name: 'Robert Garcia',
            role: 'Portfolio Associate',
            avatarUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAIttH_Byx0v3mrzsddfnDXb4vii836Rv8onsYu3lhE9GVHMZ8bvsqiNVdkV2tPYwa8jDrACIgPuRsEZyBaoOUL6Y4zPj3I_VFtLQDfZVQN0ab81DHwwnr81s_OIUGhKFyAxMeiq4_FQtdieXOqhiqtTzdhyMMFF_fesP8j39nnUl0WnHyaYqX8ILnsRkPlPsnPx9FOhXdT2ixY9zI2xqt4-y1F9UWJ040oYMGMV7g3lFDvf9jtqm54ompMoatJdkHWBuqpoIK6VyDY',
          },
          {
            id: 'm4',
            name: 'Elena Loft',
            role: 'Legal Counsel',
          },
        ]}
        selected={ownerSelected}
        onSelect={(m) => setOwnerSelected(m)}
        onConfirm={() => {
          toast.success('Ownership transfer requested');
          setOwnerModalOpen(false);
        }}
      />
    </div>
  );
}
