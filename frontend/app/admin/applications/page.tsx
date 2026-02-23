'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Search, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { FilterBar, type FilterState } from '@/components/FilterBar';
import { ApplicationsTable, type ApplicationRow } from '@/components/ApplicationsTable';
import { ApplicationCardMobile } from '@/components/ApplicationCardMobile';
import { BulkActionBar } from '@/components/BulkActionBar';
import { ConfirmationModal } from '@/components/ConfirmationModal';
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
    <div className="space-y-5">
      {/* Header */}
      <PageHeader title="GP Applications" subtitle={`${total.toLocaleString()} total applications`}>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Search + Refresh row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchApplications}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Table (desktop/tablet) / Cards (mobile) */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop table */}
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
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
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
        onChangeOwner={() => toast('Change owner — coming soon')}
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
    </div>
  );
}
