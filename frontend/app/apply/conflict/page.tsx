"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { gpApplicationsApi } from "@/lib/api";

type PageState = "conflict" | "requesting" | "requested";

export default function ConflictPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appId = searchParams.get("appId") ?? "";
  const ownerName = searchParams.get("ownerName") ?? "your colleague";
  const companyName = searchParams.get("companyName") ?? "your company";
  // If the backend says a request is already pending, start in the "requested" state
  const alreadyPending = searchParams.get("pending") === "true";
  // If the conflicting application is submitted, redirect straight to the submitted screen
  const applicationSubmitted = searchParams.get("submitted") === "true";

  const [state, setState] = useState<PageState>(
    alreadyPending ? "requested" : "conflict",
  );
  const [error, setError] = useState<string | null>(null);

  // If the company's application is already submitted, redirect to submitted screen
  useEffect(() => {
    if (applicationSubmitted) {
      router.replace(
        `/apply/submitted?companyName=${encodeURIComponent(companyName)}`,
      );
    }
  }, [applicationSubmitted, companyName, router]);

  const handleRequestAccess = async () => {
    if (!appId) return;
    setState("requesting");
    try {
      await gpApplicationsApi.requestAccess(appId);
      setState("requested");
    } catch {
      setError("Failed to send request. Please try again.");
      setState("conflict");
    }
  };

  if (state === "requested") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top banner */}
          <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 50%, #8b5cf6 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <svg
                className="w-8 h-8 text-green-600"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wide mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Approval
            </span>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Request Sent!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We have notified{" "}
              <span className="font-semibold text-gray-800">{ownerName}</span>{" "}
              that you are requesting access to the{" "}
              <span className="font-semibold text-gray-800">{companyName}</span>{" "}
              application.
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
                If <span className="font-semibold">{ownerName}</span> is no
                longer with the firm, please contact{" "}
                <span className="text-blue-600 font-semibold">
                  RAISE support
                </span>{" "}
                for a manual ownership transfer.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-md mb-3"
            >
              Return to Dashboard
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              Request logged ·{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top banner */}
        <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, #f59e0b 0%, transparent 60%), radial-gradient(circle at 70% 50%, #ef4444 0%, transparent 60%)",
            }}
          />
          {/* Globe icon placeholder */}
          <div className="absolute inset-0 flex items-end justify-center pb-0 opacity-20">
            <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
              <ellipse
                cx="90"
                cy="90"
                rx="88"
                ry="88"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <ellipse
                cx="90"
                cy="90"
                rx="55"
                ry="88"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <ellipse
                cx="90"
                cy="90"
                rx="28"
                ry="88"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <line
                x1="2"
                y1="50"
                x2="178"
                y2="50"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <line
                x1="2"
                y1="20"
                x2="178"
                y2="20"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="relative z-10 w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
            Duplicate Application Detected
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Firm Domain Conflict
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            An application for{" "}
            <span className="font-bold text-gray-800">{companyName}</span> has
            already been started by{" "}
            <span className="font-bold text-gray-800">{ownerName}</span>.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRequestAccess}
            disabled={state === "requesting" || !appId}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-md mb-4 flex items-center justify-center gap-2"
          >
            {state === "requesting" ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending request…
              </>
            ) : (
              `Request access`
            )}
          </button>

          <a
            href="mailto:test@raise.com?subject=Ownership Transfer Request&body=Please help me transfer ownership of the application for the company domain."
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Contact RAISE Support to transfer ownership
          </a>
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <svg
              className="w-3 h-3"
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
            To maintain data integrity, we only allow one application per firm
            domain.
          </p>
        </div>
      </div>
    </div>
  );
}
