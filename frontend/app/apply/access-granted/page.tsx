"use client";

import { useSearchParams } from "next/navigation";

export default function AccessGrantedPage() {
  const searchParams = useSearchParams();
  const requesterEmail = searchParams.get("requester") ?? "your colleague";
  const companyName = searchParams.get("company") ?? "the firm";
  const step = searchParams.get("step") ?? "1";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top banner */}
        <div className="h-36 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center relative">
          <div className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4">
            Access Granted
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Done!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            You have granted{" "}
            <span className="font-semibold text-gray-800">
              {requesterEmail}
            </span>{" "}
            access to the{" "}
            <span className="font-semibold text-gray-800">{companyName}</span>{" "}
            application. They can continue from{" "}
            <span className="font-semibold text-gray-800">Step {step}</span>.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left flex gap-3">
            <svg
              className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              A confirmation email has been sent to{" "}
              <span className="font-semibold">{requesterEmail}</span> with a
              link to continue the application.
            </p>
          </div>

          <p className="text-xs text-gray-400">You can close this window.</p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-400">
            Need help?{" "}
            <a
              href="mailto:test@raise.com"
              className="text-indigo-500 hover:underline"
            >
              Contact RAISE Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
