"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

type Step1Form = {
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  companyWebsite: string;
  headquarters: string;
  yearFounded: string;
  legalStructure: string;
  referredBy: string;
  partnerBackground: string;
  menPartners: string;
  womenPartners: string;
  otherGenderPartners: string;
  racialIdentities: string[];
  ownershipMen: string;
  ownershipWomen: string;
  ownershipWhite: string;
  ownershipBipoc: string;
  includeVeterans: boolean;
  includeLgbtq: boolean;
};

export default function StepOne({
  form,
  onChange,
  onNext,
  saving,
}: {
  form: Step1Form;
  onChange: (
    field: keyof Step1Form,
    value: string | boolean | string[],
  ) => void;
  onNext?: () => void;
  saving?: boolean;
}) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof Step1Form, string>>
  >({});

  const toggleRacialIdentity = (identity: string) => {
    const current = form.racialIdentities || [];
    const updated = current.includes(identity)
      ? current.filter((r) => r !== identity)
      : [...current, identity];
    onChange("racialIdentities", updated);
  };

  const validate = () => {
    const errs: Partial<Record<keyof Step1Form, string>> = {};
    if (!form.companyName?.trim())
      errs.companyName = "Company name is required.";
    if (!form.primaryContactName?.trim())
      errs.primaryContactName = "Contact name is required.";
    if (!form.primaryContactEmail?.trim())
      errs.primaryContactEmail = "Contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContactEmail))
      errs.primaryContactEmail = "Enter a valid email address.";
    if (!form.headquarters?.trim())
      errs.headquarters = "Headquarters location is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const first = document.querySelector('[data-error="true"]');
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext?.();
  };

  const inputCls = (field: keyof Step1Form) =>
    `block w-full rounded border text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300 ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="text-slate-800 pb-32">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="text-blue-800 font-bold text-xl tracking-[0.2em]">
          RAISE
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors">
          FAQ
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-12 flex">
        {/* Step sidebar */}
        <div className="relative mr-8 pt-2 hidden md:block">
          <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-300 -z-10" />
          <div className="flex flex-col gap-[240px]">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0 ${
                  n === 1 ? "bg-blue-800" : "bg-gray-300"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-tight">
                GP Application
              </h1>
              <p className="text-[11px] text-gray-500 mt-1 max-w-lg">
                Complete all 5 steps of this form to submit your application for
                the RAISE Global Summit.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Progress
              </div>
              <div className="text-[11px] font-bold text-blue-800">
                PAGE 1 OF 5
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Referred By */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">
                Referred By
              </h2>
              <p className="text-[10px] text-gray-500 italic mb-2">
                If you were referred to RAISE by another member of the RAISE
                community, please list their name and email below.
              </p>
              <input
                type="text"
                placeholder="Enter name and email address"
                className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300 mt-4"
                value={form.referredBy || ""}
                onChange={(e) => onChange("referredBy", e.target.value)}
              />
            </div>

            {/* Primary Contact */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">
                Primary Contact
              </h2>
              <div className="bg-gray-50 border border-gray-100 rounded p-4 mb-6">
                <p className="text-[11px] leading-relaxed text-gray-600 italic">
                  Owing to space constraints, only one partner from each fund
                  can attend the RAISE event. This partner will be listed as the
                  attendee, included in the Database (if you opt-in), and
                  designated as the Presenter (if selected).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div data-error={!!errors.primaryContactName}>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls("primaryContactName")}
                    value={form.primaryContactName || ""}
                    onChange={(e) =>
                      onChange("primaryContactName", e.target.value)
                    }
                    placeholder="e.g. Jane Smith"
                  />
                  {errors.primaryContactName && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.primaryContactName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.primaryContactPhone || ""}
                    onChange={(e) =>
                      onChange("primaryContactPhone", e.target.value)
                    }
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div
                  data-error={!!errors.primaryContactEmail}
                  className="col-span-2"
                >
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputCls("primaryContactEmail")}
                    value={form.primaryContactEmail || ""}
                    onChange={(e) =>
                      onChange("primaryContactEmail", e.target.value)
                    }
                    placeholder="you@firm.com"
                  />
                  {errors.primaryContactEmail && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.primaryContactEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">
                Company Info
              </h2>
              <div className="space-y-3">
                <div
                  className="grid grid-cols-[180px_1fr] items-start gap-4"
                  data-error={!!errors.companyName}
                >
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight pt-2">
                    Company Name: <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      className={inputCls("companyName")}
                      value={form.companyName || ""}
                      onChange={(e) => onChange("companyName", e.target.value)}
                      placeholder="e.g. Acme Ventures"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-[11px] mt-1">
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">
                    Company Website:
                  </label>
                  <input
                    type="url"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm placeholder:text-gray-300"
                    value={form.companyWebsite || ""}
                    onChange={(e) => onChange("companyWebsite", e.target.value)}
                    placeholder="https://yourfirm.com"
                  />
                </div>
                <div
                  className="grid grid-cols-[180px_1fr] items-start gap-4"
                  data-error={!!errors.headquarters}
                >
                  <div>
                    <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight block">
                      Headquarters: <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[9px] text-gray-400 uppercase">
                      (City, Country)
                    </span>
                  </div>
                  <div>
                    <input
                      type="text"
                      className={inputCls("headquarters")}
                      value={form.headquarters || ""}
                      onChange={(e) => onChange("headquarters", e.target.value)}
                      placeholder="e.g. New York, USA"
                    />
                    {errors.headquarters && (
                      <p className="text-red-500 text-[11px] mt-1">
                        {errors.headquarters}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">
                    Year Founded:
                  </label>
                  <input
                    type="number"
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm"
                    value={form.yearFounded || ""}
                    onChange={(e) => onChange("yearFounded", e.target.value)}
                    placeholder="YYYY"
                    min={1900}
                    max={2026}
                  />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">
                    Legal Structure:
                  </label>
                  <select
                    className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm"
                    value={form.legalStructure || ""}
                    onChange={(e) => onChange("legalStructure", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="LP">LP (Limited Partnership)</option>
                    <option value="LLC">LLC</option>
                    <option value="Corp">Corporation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investing Partners */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider mb-4">
                Investing Partners
              </h2>
              <div className="mb-6">
                <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1 block">
                  How would you characterize the background of your investing
                  partners?
                </label>
                <select
                  className="block w-full rounded border-gray-300 text-[13px] py-1.5 px-3 focus:border-blue-600 focus:ring-blue-600 shadow-sm"
                  value={form.partnerBackground || ""}
                  onChange={(e) =>
                    onChange("partnerBackground", e.target.value)
                  }
                >
                  <option value="">Select…</option>
                  <option value="angel">
                    Angel investors raising a blind pool
                  </option>
                  <option value="institutional">
                    Institutional Fund Managers
                  </option>
                  <option value="family-office">Family Office</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">
                    Partner Composition
                  </h3>
                  <div className="space-y-3">
                    {(
                      [
                        "menPartners",
                        "womenPartners",
                        "otherGenderPartners",
                      ] as const
                    ).map((field, i) => (
                      <div
                        key={field}
                        className={`flex justify-between items-center ${i > 0 ? "border-t border-gray-50 pt-3" : ""}`}
                      >
                        <span className="text-[12px] text-gray-600">
                          {field === "menPartners"
                            ? "Men"
                            : field === "womenPartners"
                              ? "Women"
                              : "Another gender"}
                        </span>
                        <input
                          type="number"
                          min={0}
                          className="block rounded border-gray-300 text-[13px] py-1 px-2 focus:border-blue-600 focus:ring-blue-600 shadow-sm w-16 text-center"
                          value={form[field] || "0"}
                          onChange={(e) => onChange(field, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                    Racial and ethnic identities
                  </h3>
                  <p className="text-[9px] text-gray-400 mb-2 uppercase">
                    (Check all that apply)
                  </p>
                  <div className="bg-gray-50 rounded-md p-4 space-y-2 border border-gray-100">
                    {[
                      "White",
                      "Black or African American",
                      "Hispanic, Latinx, or Spanish Origin",
                      "Asian or Asian American",
                      "Middle Eastern or North African",
                      "American Indian or Native Alaskan",
                    ].map((id) => (
                      <label key={id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800"
                          checked={(form.racialIdentities || []).includes(id)}
                          onChange={() => toggleRacialIdentity(id)}
                        />
                        <span className="text-[11px] text-gray-600">{id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[11px] font-bold text-gray-700 uppercase">
                    My team also includes:
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase">
                    (Check all that apply)
                  </span>
                </div>
                <div className="flex space-x-8">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800"
                      checked={!!form.includeVeterans}
                      onChange={(e) =>
                        onChange("includeVeterans", e.target.checked)
                      }
                    />
                    <span className="text-[11px] text-gray-600">
                      Military Veterans
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-800"
                      checked={!!form.includeLgbtq}
                      onChange={(e) =>
                        onChange("includeLgbtq", e.target.checked)
                      }
                    />
                    <span className="text-[11px] text-gray-600">LGBTQ+</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-blue-800 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] z-50">
              <div className="max-w-[1100px] mx-auto px-8 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white text-base font-bold">
                    Ready for the next step?
                  </h3>
                  <p className="text-blue-100 text-[10px] opacity-90 uppercase tracking-wide">
                    Fill required fields marked with * to continue.
                  </p>
                </div>
                <button
                  className="bg-white text-blue-800 font-bold text-[11px] uppercase tracking-widest px-10 py-3.5 rounded-md hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  type="submit"
                  disabled={saving}
                >
                  {saving && (
                    <span className="inline-block h-4 w-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? "Saving…" : "Save & Continue to Page 2"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <div className="fixed right-6 bottom-32 z-40">
        <button className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <Moon className="text-gray-400" size={18} />
        </button>
      </div>
    </div>
  );
}
