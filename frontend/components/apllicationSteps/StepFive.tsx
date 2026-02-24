"use client";

import { useState } from "react";
import {
  ChevronRight,
  Database,
  Image as ImageIcon,
  SquarePen,
  Eye,
  Globe,
  Lock,
  Upload,
  User,
  Info,
} from "lucide-react";

type Step5Form = {
  databaseOpt: "public" | "private";
  headline: string;
  summary: string;
  allowDeck: boolean;
  allowTrack: boolean;
};

export default function StepFive({
  form,
  onChange,
  onNext,
  onBack,
  saving,
}: {
  form: Step5Form;
  onChange: (field: keyof Step5Form, value: string | boolean) => void;
  onNext?: () => void;
  onBack?: () => void;
  saving?: boolean;
}) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof Step5Form, string>>
  >({});

  const validate = () => {
    const errs: Partial<Record<keyof Step5Form, string>> = {};
    if (!form.databaseOpt)
      errs.databaseOpt = "Please choose a database opt-in preference.";
    if (!form.headline?.trim())
      errs.headline = "A one-line pitch headline is required.";
    if (!form.summary?.trim())
      errs.summary = "An executive summary is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document
        .querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onNext?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 md:px-20 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-blue-600">
              <svg className="h-8 w-8" viewBox="0 0 48 48" fill="currentColor">
                <path d="M24 .8 47.2 24 24 47.2.8 24 24 .8ZM21 35.8V12.2L9.2 24 21 35.8Z" />
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase">
              Raise
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-400">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="contents">
                <span className="text-blue-600">Step {n}</span>
                <ChevronRight size={14} className="text-gray-400" />
              </span>
            ))}
            <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded">
              Step 5
            </span>
          </div>
          <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">
            PAGE 5 OF 5
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-10 pb-40 w-full">
        <div className="mb-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight uppercase">
                Step 5: DATABASE OPT-IN &amp; SUBMISSION
              </h1>
              <p className="text-gray-500 mt-1 max-w-2xl">
                Finalize your application for the RAISE Global Summit and set up
                your public profile for LP visibility.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-sm font-bold text-blue-600">
                100% Complete
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full transition-all duration-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Database Opt-In */}
          <section
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            data-error={!!errors.databaseOpt}
          >
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <Database className="text-blue-600" />
              <h2 className="text-lg font-bold tracking-tight uppercase">
                RAISE Emerging Manager Database{" "}
                <span className="text-red-500">*</span>
              </h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                Choose how your application data will be handled post-summit.
                Our database is accessed by qualified LPs globally.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex flex-col p-6 cursor-pointer rounded-xl border-2 transition-all ${form.databaseOpt === "public" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                >
                  <input
                    name="database_opt"
                    type="radio"
                    value="public"
                    className="sr-only"
                    checked={form.databaseOpt === "public"}
                    onChange={() => onChange("databaseOpt", "public")}
                  />
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={`h-6 w-6 rounded-full border-4 bg-white flex items-center justify-center ${form.databaseOpt === "public" ? "border-blue-600" : "border-gray-300"}`}
                    >
                      {form.databaseOpt === "public" && (
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <Globe className="text-blue-600 opacity-20" size={28} />
                  </div>
                  <span className="font-bold mb-1">Yes - Public Listing</span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Publish on the RAISE Emerging Manager Database for LP
                    discovery.
                  </span>
                </label>
                <label
                  className={`relative flex flex-col p-6 cursor-pointer rounded-xl border-2 transition-all ${form.databaseOpt === "private" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                >
                  <input
                    name="database_opt"
                    type="radio"
                    value="private"
                    className="sr-only"
                    checked={form.databaseOpt === "private"}
                    onChange={() => onChange("databaseOpt", "private")}
                  />
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={`h-6 w-6 rounded-full border-2 bg-white ${form.databaseOpt === "private" ? "border-blue-600" : "border-gray-300"}`}
                    />
                    <Lock className="text-gray-300" size={28} />
                  </div>
                  <span className="font-bold mb-1">No - Private Selection</span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Only submit for the private Selection Committee review
                    process.
                  </span>
                </label>
              </div>
              {errors.databaseOpt && (
                <p className="text-red-500 text-xs mt-3">
                  {errors.databaseOpt}
                </p>
              )}
            </div>
          </section>

          {/* Profile Visuals */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <ImageIcon className="text-blue-600" />
              <h2 className="text-lg font-bold tracking-tight uppercase">
                Profile Visuals
              </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  label: "Company Logo",
                  icon: (
                    <Upload className="text-gray-400 group-hover:text-blue-600" />
                  ),
                  sub: "SVG, PNG (Transparent)",
                  shape: "rounded-lg",
                },
                {
                  label: "Lead Partner Headshot",
                  icon: (
                    <User className="text-gray-400 group-hover:text-blue-600" />
                  ),
                  sub: "JPG, PNG (Min 400x400px)",
                  shape: "rounded-full",
                },
              ].map(({ label, icon, sub, shape }) => (
                <div key={label}>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {label}
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-600 transition-colors cursor-pointer group">
                    <div
                      className={`h-16 w-16 bg-gray-100 ${shape} flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors overflow-hidden`}
                    >
                      {icon}
                    </div>
                    <p className="text-xs font-bold">
                      Upload{" "}
                      {label === "Company Logo" ? "Brand Asset" : "Portrait"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Executive Summary */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <SquarePen className="text-blue-600" />
              <h2 className="text-lg font-bold tracking-tight uppercase">
                Executive Summary
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div data-error={!!errors.headline}>
                <label
                  className="block text-sm font-bold text-gray-700 mb-2"
                  htmlFor="headline"
                >
                  One-line Pitch (Headline){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="headline"
                  type="text"
                  placeholder="e.g. Scaling the next generation of climate infrastructure in emerging markets."
                  className={`w-full rounded-lg py-3 px-4 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-400 ${errors.headline ? "border-red-500 bg-red-50" : "bg-gray-50 border-gray-200"}`}
                  value={form.headline || ""}
                  onChange={(e) => onChange("headline", e.target.value)}
                />
                {errors.headline && (
                  <p className="text-red-500 text-xs mt-1">{errors.headline}</p>
                )}
              </div>
              <div data-error={!!errors.summary}>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-sm font-bold text-gray-700"
                    htmlFor="summary"
                  >
                    Concise Executive Summary{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {(form.summary || "").length} / 1000 Characters
                  </span>
                </div>
                <textarea
                  id="summary"
                  rows={6}
                  placeholder="Provide a high-level overview of your investment thesis, team background, and fund performance…"
                  className={`w-full rounded-lg py-3 px-4 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-400 ${errors.summary ? "border-red-500 bg-red-50" : "bg-gray-50 border-gray-200"}`}
                  value={form.summary || ""}
                  onChange={(e) => onChange("summary", e.target.value)}
                  maxLength={1000}
                />
                {errors.summary && (
                  <p className="text-red-500 text-xs mt-1">{errors.summary}</p>
                )}
              </div>
            </div>
          </section>

          {/* Visibility Permissions */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <Eye className="text-blue-600" />
              <h2 className="text-lg font-bold tracking-tight uppercase">
                Visibility Permissions
              </h2>
            </div>
            <div className="p-8 space-y-4">
              {[
                {
                  label: "Allow LPs to access fundraising deck",
                  sub: "Only verified LPs will see the Download Deck button on your profile.",
                  field: "allowDeck" as const,
                },
                {
                  label: "Allow LPs to view track record data",
                  sub: "Visibility of detailed IRRs and portfolio company metrics to verified LPs.",
                  field: "allowTrack" as const,
                },
              ].map(({ label, sub, field }) => (
                <div
                  key={field}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!form[field]}
                      onChange={(e) => onChange(field, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-blue-600 border-t border-white/10 px-6 py-4 z-[100] shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="text-white/70" size={16} />
            <p className="text-[11px] text-white/70 uppercase font-bold tracking-widest">
              Your information is secure and encrypted
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 sm:flex-none px-8 py-3 rounded-lg border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-colors uppercase tracking-wider"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-white text-blue-600 font-black text-sm hover:bg-gray-50 transition-all uppercase tracking-widest shadow-lg flex items-center gap-2 justify-center disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : null}
              {saving ? "Submitting…" : "Submit Final Application"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
