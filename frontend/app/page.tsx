'use client';

import { redirect } from 'next/navigation';

// Root redirects to admin dashboard (middleware handles auth)
export default function RootPage() {
  redirect('/admin/dashboard');
}
