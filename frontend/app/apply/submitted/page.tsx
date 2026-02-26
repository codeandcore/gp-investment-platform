"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SubmittedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyName = searchParams.get("companyName") ?? "your firm";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top banner */}
        <div className="h-40 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute w-48 h-48 rounded-full border-2 border-green-200/50 opacity-60" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-green-300/50 opacity-60" />
          <div className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Under Review
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            The application for{" "}
            <span className="font-bold text-gray-800">{companyName}</span> has
            been submitted and is currently under review by the RAISE team.
          </p>

          {/* Timeline */}
          <div className="text-left mb-6 space-y-3">
            {[
              { label: "Application submitted", done: true },
              {
                label: "Initial screening by RAISE team",
                done: false,
                active: true,
              },
              { label: "Due diligence review", done: false },
              { label: "Investment committee decision", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                    step.done
                      ? "bg-green-500 border-green-500"
                      : step.active
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {step.done && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {step.active && !step.done && (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step.done
                      ? "text-gray-800 font-medium"
                      : step.active
                        ? "text-indigo-600 font-medium"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left flex gap-3 mb-4">
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
              You will be notified by email when your application status
              changes. This process typically takes 5–10 business days.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50 text-sm"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-3 text-center">
          <p className="text-xs text-gray-400">
            Questions?{" "}
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
