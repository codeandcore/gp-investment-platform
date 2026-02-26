"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bell,
  Send,
  ClipboardList,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusChip } from "@/components/StatusChip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/utils";
import { applicationsApi } from "@/lib/api";
import toast from "react-hot-toast";

export interface ApplicationRow {
  _id: string;
  uniqueId: string;
  companyName: string;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactEmail?: string;
  applicantProgressStatus: string;
  adminQualificationStatus?: string;
  databaseStatus?: string;
  documents?: { deckUrl?: string };
  lastActivityAt?: string;
  ownershipHistory?: Array<{
    ownerId?: string;
    ownerName?: string | null;
    ownerEmail?: string | null;
    startedAt?: string;
    transferredBy?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
    } | null;
    endedAt?: string | null;
  }>;
}

interface ApplicationsTableProps {
  data: ApplicationRow[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
}

const col = createColumnHelper<ApplicationRow>();

export function ApplicationsTable({
  data,
  onSelectionChange,
  onRefresh,
}: ApplicationsTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleAction = async (action: string, id: string) => {
    try {
      if (
        action === "qualified" ||
        action === "not_qualified" ||
        action === "attending_raise"
      ) {
        await applicationsApi.updateQualificationStatus(id, action);
        toast.success("Status updated");
        onRefresh();
      } else if (action === "reminder") {
        await applicationsApi.bulkAction("send_reminder", [id]);
        toast.success("Reminder sent");
      } else if (action === "opt_in") {
        await applicationsApi.bulkAction("send_opt_in_nudge", [id]);
        toast.success("Opt-in nudge sent");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const columns = useMemo(
    () => [
      col.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
        size: 40,
      }),
      col.accessor("uniqueId", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500">
            {info.getValue()}
          </span>
        ),
      }),
      col.accessor("companyName", {
        header: "Company",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-semibold text-xs">
                {info.getValue()?.slice(0, 2).toUpperCase() ?? "NA"}
              </span>
            </div>
            <span className="font-medium text-gray-900 text-sm">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      col.display({
        id: "contact",
        header: "Primary Contact",
        cell: ({ row }) => {
          const app = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {app.primaryContactFirstName} {app.primaryContactLastName}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[160px]">
                {app.primaryContactEmail}
              </p>
            </div>
          );
        },
      }),
      col.accessor("applicantProgressStatus", {
        header: "Progress",
        cell: (info) => <StatusChip status={info.getValue()} />,
      }),
      col.accessor("adminQualificationStatus", {
        header: "Qualification",
        cell: (info) =>
          info.getValue() ? (
            <StatusChip status={info.getValue()!} />
          ) : (
            <span className="text-gray-300">—</span>
          ),
      }),
      col.accessor("databaseStatus", {
        header: "Database",
        cell: (info) =>
          info.getValue() ? (
            <StatusChip status={info.getValue()!} />
          ) : (
            <span className="text-gray-300">—</span>
          ),
      }),
      col.display({
        id: "preview",
        header: "Preview",
        cell: ({ row }) => (
          <button
            onClick={() =>
              router.push(`/admin/applications/${row.original._id}`)
            }
            className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
          >
            View
          </button>
        ),
      }),
      col.display({
        id: "deck",
        header: "Deck",
        cell: ({ row }) => {
          const deckUrl = row.original.documents?.deckUrl;
          return deckUrl ? (
            <a
              href={deckUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <FileText className="h-3 w-3" /> Open
            </a>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          );
        },
      }),
      col.accessor("lastActivityAt", {
        header: "Last Activity",
        cell: (info) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(info.getValue())}
          </span>
        ),
      }),
      col.display({
        id: "ownership",
        header: "Ownership",
        cell: ({ row }) => {
          const history = row.original.ownershipHistory;
          if (!history || history.length === 0) {
            return <span className="text-gray-300 text-xs">—</span>;
          }
          // Show abbreviated chain: first entry (originator) to last entry (current)
          return (
            <div className="flex flex-col gap-0.5 min-w-[160px] max-w-[220px]">
              {history.map((entry, idx) => {
                const isLast = idx === history.length - 1;
                const date = entry.startedAt
                  ? new Date(entry.startedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })
                  : "";
                return (
                  <div key={idx} className="flex items-start gap-1">
                    {history.length > 1 && (
                      <span className="text-gray-300 text-xs mt-0.5">
                        {isLast ? "└" : "├"}
                      </span>
                    )}
                    <div>
                      <span
                        className={`text-xs font-medium ${isLast ? "text-gray-800" : "text-gray-400"}`}
                      >
                        {entry.ownerName || entry.ownerEmail || "Unknown"}
                      </span>
                      {date && (
                        <span className="text-xs text-gray-400 ml-1">
                          {date}
                        </span>
                      )}
                      {entry.transferredBy?.name && (
                        <div className="text-xs text-gray-400">
                          via {entry.transferredBy.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      }),
      col.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const app = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/applications/${app._id}`)}
                >
                  <Eye className="h-4 w-4" /> View Detail
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAction("qualified", app._id)}
                >
                  <CheckCircle className="h-4 w-4 text-green-500" /> Mark
                  Qualified
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("not_qualified", app._id)}
                >
                  <XCircle className="h-4 w-4 text-red-500" /> Mark Not
                  Qualified
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("attending_raise", app._id)}
                >
                  <TrendingUp className="h-4 w-4 text-yellow-500" /> Mark
                  Attending Raise
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAction("reminder", app._id)}
                >
                  <Bell className="h-4 w-4" /> Send Reminder Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("opt_in", app._id)}
                >
                  <Send className="h-4 w-4" /> Send Opt-In Nudge
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/applications/${app._id}?tab=audit`)
                  }
                >
                  <ClipboardList className="h-4 w-4" /> View Audit Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [router],
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const newState =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newState);
      const selectedIds = Object.keys(newState)
        .filter((k) => newState[k])
        .map((k) => data[Number(k)]?._id)
        .filter(Boolean) as string[];
      onSelectionChange(selectedIds);
    },
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-gray-100 bg-slate-50">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-400 py-16 text-sm"
              >
                No applications found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  row.getIsSelected() ? "bg-primary/10" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
