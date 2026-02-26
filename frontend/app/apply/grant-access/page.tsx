"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

type State = "loading" | "success" | "error";

export default function GrantAccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<State>("loading");
  const [info, setInfo] = useState<{
    requesterEmail?: string;
    companyName?: string;
    continueStep?: number;
    error?: string;
  }>({});

  useEffect(() => {
    const doGrant = async () => {
      if (!token) {
        setState("error");
        setInfo({ error: "No token provided in the link." });
        return;
      }

      try {
        const res = await axios.post(`/api/grant-access`, { token });
        setInfo({
          requesterEmail: res.data.requesterEmail,
          companyName: res.data.companyName,
          continueStep: res.data.continueStep,
        });
        setState("success");
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "This link is invalid or has already been used.";
        setInfo({ error: msg });
        setState("error");
      }
    };

    doGrant();
  }, [token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Granting access…</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <div className="px-8 py-7 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Link Expired or Invalid
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {info.error}
            </p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <svg
              className="w-7 h-7 text-white"
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
        <div className="px-8 py-7 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4">
            Access Granted
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Done!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            You have granted{" "}
            <span className="font-semibold text-gray-800">
              {info.requesterEmail}
            </span>{" "}
            access to the{" "}
            <span className="font-semibold text-gray-800">
              {info.companyName}
            </span>{" "}
            application. They can continue from{" "}
            <span className="font-semibold text-gray-800">
              Step {info.continueStep}
            </span>
            .
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-left flex gap-3">
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
              <span className="font-semibold">{info.requesterEmail}</span> with
              a link to continue the application.
            </p>
          </div>
          <p className="text-xs text-gray-400">You can close this window.</p>
        </div>
        <div className="border-t border-gray-100 px-8 py-3 text-center">
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
