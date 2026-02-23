'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, FileText, TrendingUp, Users, Activity, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Fundraising', href: '/admin/fundraising', icon: TrendingUp },
  { label: 'GP Profiles', href: '/admin/gp-profiles', icon: Users },
  { label: 'Engagement', href: '/admin/engagement', icon: Activity },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">GP</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">GP Analytics</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-1 rounded-md text-gray-500 hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Slide drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-0.5">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active ? 'text-indigo-600' : 'text-gray-400')} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-2 truncate">{user?.email}</p>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
