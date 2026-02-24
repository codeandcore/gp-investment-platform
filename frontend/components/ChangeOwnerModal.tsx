'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

interface ChangeOwnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOwner?: TeamMember;
  team?: TeamMember[];
  onSelect?: (member: TeamMember) => void;
  selected?: TeamMember | null;
  onConfirm?: () => void;
}

export function ChangeOwnerModal({
  open,
  onOpenChange,
  currentOwner,
  team = [],
  onSelect,
  selected,
  onConfirm,
}: ChangeOwnerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-xl">Change Application Owner</DialogTitle>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {currentOwner && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                Current Owner
              </p>
              <div className="flex items-center space-x-3">
                <img
                  alt={currentOwner.name}
                  src={currentOwner.avatarUrl}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{currentOwner.name}</p>
                  {currentOwner.role && (
                    <p className="text-xs text-gray-500">{currentOwner.role}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assign to new owner</label>
            <div className="relative">
              <Input
                placeholder="Search team members by name or role..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Suggested Team Members
            </p>
            <div className="space-y-1">
              {team.map((m) => {
                const isSelected = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelect?.(m)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                      isSelected
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {m.avatarUrl ? (
                        <img
                          alt={m.name}
                          src={m.avatarUrl}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {(m.name ?? 'NA').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        {m.role && <p className="text-xs text-gray-500">{m.role}</p>}
                      </div>
                    </div>
                    {isSelected && (
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-5 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mr-auto">
            The current owner will be notified of this transfer.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Transfer Ownership</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
