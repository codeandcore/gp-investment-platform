"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { gpApplicationsApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function ResumePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lastStep = Number(searchParams.get("lastStep") ?? "0");
  const companyName = searchParams.get("companyName") ?? "your firm";
  const totalSteps = 5;
  const completedSteps = Math.min(lastStep, totalSteps);
  const nextStep = Math.min(lastStep + 1, totalSteps);
  const percentComplete = Math.round((completedSteps / totalSteps) * 100);

  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleContinue = () => {
    router.push(`/apply/step/${nextStep}`);
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await gpApplicationsApi.reset();
      toast.success("Previous application cleared. Starting fresh!");
      router.push("/apply/step/1");
    } catch {
      toast.error("Failed to reset application. Please try again.");
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top banner with progress illustration */}
        <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
          {/* Background step cards */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-60">
            <div className="w-10 h-12 bg-blue-200/60 rounded-lg" />
            <div className="w-32 h-16 bg-white rounded-xl shadow-sm flex items-center gap-3 px-3">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 w-20 bg-gray-200 rounded-full" />
                <div className="h-2 w-16 bg-blue-400 rounded-full" />
              </div>
            </div>
            <div className="w-10 h-12 bg-indigo-200/60 rounded-lg" />
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            You have an application in progress for{" "}
            <span className="font-bold text-gray-800">{companyName}</span>.
          </p>

          {/* Progress card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
                <span className="text-sm font-medium text-gray-700">
                  Step {completedSteps} of {totalSteps} finished
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {percentComplete}% Complete
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-md mb-3 flex items-center justify-center gap-2"
          >
            Continue Application
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-600 font-medium py-3.5 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Discard &amp; Start New
            </button>
          ) : (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-left">
              <div className="flex items-start gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
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
                <p className="text-xs text-red-700">
                  Starting new will{" "}
                  <span className="font-bold">permanently delete</span> your
                  existing progress. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  disabled={resetting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  {resetting ? "Deleting…" : "Delete & Start Fresh"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-3 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Secure Session
          </p>
        </div>
      </div>
    </div>
  );
}
