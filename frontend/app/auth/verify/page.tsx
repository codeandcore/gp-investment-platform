'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();

  const verifying = useRef(false);

  useEffect(() => {
    if (verifying.current) return;
    
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      toast.error('Invalid or incomplete magic link');
      router.push('/login');
      return;
    }

    verifying.current = true;

    authApi
      .verifyToken(token, email)
      .then((res) => {
        toast.success('Signed in successfully!');
        const redirectPath = res.data?.redirectPath || '/admin/dashboard';
        router.push(redirectPath);
      })
      .catch((err) => {
        console.error('Verification error:', err);
        toast.error('Link expired or invalid. Please request a new one.');
        router.push('/login');
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Verifying your link…</p>
      </div>
    </div>
  );
}
