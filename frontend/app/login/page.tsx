'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import type { Metadata } from 'next';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      await authApi.sendMagicLink(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute top-16 left-1/4 w-72 h-72 bg-indigo-200/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-200/30 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Wand2 className="h-7 w-7 text-white" />
              </div>
            </div>

            {!sent ? (
              <>
                {/* Heading */}
                <div className="text-center mb-7">
                  <h1 className="text-2xl font-bold text-gray-900">Sign in to Admin Console</h1>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your email to receive a secure magic link.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="name@company.com"
                        autoComplete="email"
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {loading ? 'Sending…' : 'Send magic link'}
                  </button>
                </form>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-400 uppercase tracking-widest">
                  <Lock className="h-3 w-3" />
                  <span>Secure passwordless login</span>
                </div>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4">
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We sent a sign-in link to{' '}
                  <span className="font-semibold text-gray-800">{getValues('email')}</span>.
                  <br />
                  Click it to access the Admin Console.
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-50 bg-gray-50/50 px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              Having trouble signing in?{' '}
              <a href="mailto:support@gpplatform.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Dots decoration */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-1 bg-indigo-200 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
