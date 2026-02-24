"use client";

import { useState } from "react";
import {
  Building2,
  LineChart,
  GraduationCap,
  CreditCard,
  Users,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type Step2Form = {
  investmentStages: string[];
  investmentThesis: string;
  globalFocus: string;
  geographicFocus: string;
  totalCommittedCapital: string;
  firstInvestmentYear: string;
  numberOfBlindPoolFunds: string;
  numberOfSpvs: string;
  fundraisingStatus: string;
  targetFundSize: string;
  minCheckSize: string;
  expectedFinalClose: string;
  legalCounsel: string;
  fundAdmin: string;
  taxPartner: string;
  auditPartner: string;
  complianceOther: string;
};

export default function StepTwo({
  form,
  onChange,
  toggleStage,
  onNext,
  onBack,
  saving,
}: {
  form: Step2Form;
  onChange: (field: keyof Step2Form, value: string) => void;
  toggleStage: (stage: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  saving?: boolean;
}) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof Step2Form, string>>
  >({});

  const validate = () => {
    const errs: Partial<Record<keyof Step2Form, string>> = {};
    if (!form.investmentStages || form.investmentStages.length === 0)
      errs.investmentStages = "Select at least one investment stage.";
    if (!form.investmentThesis?.trim())
      errs.investmentThesis = "Investment thesis is required.";
    if (!form.geographicFocus?.trim())
      errs.geographicFocus = "Geographic focus details are required.";
    if (!form.totalCommittedCapital?.trim())
      errs.totalCommittedCapital = "Total committed capital is required.";
    if (!form.firstInvestmentYear?.trim())
      errs.firstInvestmentYear = "First investment year is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document
        .querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext?.();
  };

  const inputCls = (field: keyof Step2Form) =>
    `w-full rounded-lg text-sm py-2.5 px-3 focus:border-blue-600 focus:ring-blue-600 ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Building2 size={18} />
            </div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">
              RAISE
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`text-xs font-bold uppercase tracking-wider ${
                    n === 2
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-400"
                  }`}
                >
                  Step {n}
                </span>
              ))}
            </nav>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
              PAGE 2 OF 5
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 pb-32">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className="text-2xl font-extrabold mb-1">
                Company Focus &amp; History
              </h1>
              <p className="text-gray-500 text-sm">
                Provide detailed information about your firm&apos;s strategy and
                track record.
              </p>
            </div>
            <div className="text-right">
              <span className="text-blue-600 font-bold text-lg">40%</span>
              <span className="text-gray-400 text-sm block uppercase tracking-tighter">
                Complete
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: "40%" }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Investment Strategy */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <LineChart className="text-blue-600" />
              <h3 className="font-bold text-lg">
                Section 1: Investment Strategy
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div data-error={!!errors.investmentStages}>
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Investment Stages <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Accelerator",
                    "Pre-Seed",
                    "Seed",
                    "Series A",
                    "Series B",
                    "Stage Agnostic",
                  ].map((label) => (
                    <label
                      key={label}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.investmentStages?.includes(label)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-600 size-5 border-gray-300"
                        checked={
                          form.investmentStages?.includes(label) || false
                        }
                        onChange={() => toggleStage(label)}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.investmentStages && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.investmentStages}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  data-error={!!errors.investmentThesis}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Investment Thesis <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputCls("investmentThesis")}
                    value={form.investmentThesis || ""}
                    onChange={(e) =>
                      onChange("investmentThesis", e.target.value)
                    }
                  >
                    <option value="">Select primary thesis…</option>
                    <option value="generalist">Generalist Tech</option>
                    <option value="fintech">Fintech Vertical</option>
                    <option value="health">Health &amp; BioTech</option>
                    <option value="saas">Enterprise SaaS</option>
                    <option value="web3">Web3 / Infrastructure</option>
                    <option value="climate">Climate Tech</option>
                  </select>
                  {errors.investmentThesis && (
                    <p className="text-red-500 text-xs">
                      {errors.investmentThesis}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Global Focus?
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                    value={form.globalFocus || "yes"}
                    onChange={(e) => onChange("globalFocus", e.target.value)}
                  >
                    <option value="no">No, Region Specific</option>
                    <option value="yes">Yes, Globally Agnostic</option>
                  </select>
                </div>
              </div>
              <div data-error={!!errors.geographicFocus} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Geographic Focus Details{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputCls("geographicFocus")} resize-none`}
                  rows={3}
                  placeholder="Specify key markets (e.g., North America, SE Asia, Western Europe)…"
                  value={form.geographicFocus || ""}
                  onChange={(e) => onChange("geographicFocus", e.target.value)}
                />
                {errors.geographicFocus && (
                  <p className="text-red-500 text-xs">
                    {errors.geographicFocus}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Firm History */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <GraduationCap className="text-blue-600" />
              <h3 className="font-bold text-lg">Section 2: Firm History</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div
                data-error={!!errors.totalCommittedCapital}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Total Committed Capital ($M){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <HelpCircle size={14} /> What is this?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className={`w-full pl-8 rounded-lg text-sm py-2.5 ${errors.totalCommittedCapital ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"} focus:border-blue-600 focus:ring-blue-600`}
                    value={form.totalCommittedCapital || ""}
                    onChange={(e) =>
                      onChange("totalCommittedCapital", e.target.value)
                    }
                  />
                </div>
                {errors.totalCommittedCapital && (
                  <p className="text-red-500 text-xs">
                    {errors.totalCommittedCapital}
                  </p>
                )}
              </div>
              <div
                data-error={!!errors.firstInvestmentYear}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  First Investment Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="YYYY"
                  className={inputCls("firstInvestmentYear")}
                  min={1950}
                  max={2026}
                  value={form.firstInvestmentYear || ""}
                  onChange={(e) =>
                    onChange("firstInvestmentYear", e.target.value)
                  }
                />
                {errors.firstInvestmentYear && (
                  <p className="text-red-500 text-xs">
                    {errors.firstInvestmentYear}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Number of Blind Pool Funds
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                  value={form.numberOfBlindPoolFunds || ""}
                  onChange={(e) =>
                    onChange("numberOfBlindPoolFunds", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Number of SPVs
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                  value={form.numberOfSpvs || ""}
                  onChange={(e) => onChange("numberOfSpvs", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Fundraising */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <CreditCard className="text-blue-600" />
              <h3 className="font-bold text-lg">Section 3: Fundraising</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Fundraising Status
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                  value={form.fundraisingStatus || "open"}
                  onChange={(e) =>
                    onChange("fundraisingStatus", e.target.value)
                  }
                >
                  <option value="pre">Pre-marketing</option>
                  <option value="open">In Market (Open)</option>
                  <option value="closed-deploying">Closed - Deploying</option>
                  <option value="closed-deployed">
                    Closed - Fully Deployed
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Target Fund Size ($M)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="50.00"
                    className="w-full pl-8 rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                    value={form.targetFundSize || ""}
                    onChange={(e) => onChange("targetFundSize", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Min Check Size
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                  value={form.minCheckSize || "250-500"}
                  onChange={(e) => onChange("minCheckSize", e.target.value)}
                >
                  <option value="100-250">$100k - $250k</option>
                  <option value="250-500">$250k - $500k</option>
                  <option value="500-1000">$500k - $1M</option>
                  <option value="1000+">$1M+</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Expected Final Close
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm py-2.5"
                  value={form.expectedFinalClose || "Q2 2025"}
                  onChange={(e) =>
                    onChange("expectedFinalClose", e.target.value)
                  }
                >
                  {[
                    "Q1 2025",
                    "Q2 2025",
                    "Q3 2025",
                    "Q4 2025",
                    "Q1 2026",
                    "Q2 2026",
                    "Q3 2026",
                    "Q4 2026",
                  ].map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Service Providers */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <Users className="text-blue-600" />
              <h3 className="font-bold text-lg">
                Section 4: Service Providers
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {(
                [
                  ["Legal Counsel", "e.g. Wilson Sonsini", "legalCounsel"],
                  ["Fund Admin", "e.g. Carta, Passthrough", "fundAdmin"],
                  ["Tax Partner", "e.g. PwC, Deloitte", "taxPartner"],
                  ["Audit Partner", "e.g. KPMG", "auditPartner"],
                ] as [string, string, keyof Step2Form][]
              ).map(([label, placeholder, key]) => (
                <div className="space-y-1" key={label}>
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full rounded-lg border-gray-200 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm"
                    value={(form[key] as string) || ""}
                    onChange={(e) => onChange(key, e.target.value)}
                  />
                </div>
              ))}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Compliance / Other
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACA Group"
                  className="w-full rounded-lg border-gray-200 bg-white focus:border-blue-600 focus:ring-blue-600 text-sm"
                  value={form.complianceOther || ""}
                  onChange={(e) => onChange("complianceOther", e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] border-t border-white/10 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-2.5 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <span className="inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : null}
            {saving ? (
              "Saving…"
            ) : (
              <>
                SAVE &amp; CONTINUE TO PAGE 3 <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
