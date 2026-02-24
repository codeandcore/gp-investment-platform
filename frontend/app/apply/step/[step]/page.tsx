'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { gpApplicationsApi, GpStep1Payload } from '@/lib/api';

interface GpApplication {
  _id: string;
  companyName?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  companyWebsite?: string;
  headquarters?: string;
  yearFounded?: number | string;
  legalStructure?: string;
  strategy?: {
    fundSize?: number;
    investmentThesis?: string;
    geographies?: string[];
    trackRecordSummary?: string;
    assetClasses?: string[];
    numberOfDeals?: number;
    previousFundCount?: number;
  };
}

interface Step2FormState {
  investmentStages: string[];
  investmentThesis: string;
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
}

interface ApplyStepPageProps {
  params: { step: string };
}

export default function ApplyStepPage({ params }: ApplyStepPageProps) {
  const router = useRouter();

  const rawStep = Number(params.step ?? '1');
  const currentStep = Number.isFinite(rawStep)
    ? Math.min(Math.max(rawStep, 1), 4)
    : 1;

  const [application, setApplication] = useState<GpApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [step1Form, setStep1Form] = useState<GpStep1Payload>({
    companyName: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    companyWebsite: '',
    headquarters: '',
    yearFounded: '',
    legalStructure: '',
  });

  const [step2Form, setStep2Form] = useState<Step2FormState>({
    investmentStages: [],
    investmentThesis: '',
    geographicFocus: '',
    totalCommittedCapital: '',
    firstInvestmentYear: '',
    numberOfBlindPoolFunds: '',
    numberOfSpvs: '',
    fundraisingStatus: '',
    targetFundSize: '',
    minCheckSize: '',
    expectedFinalClose: '',
    legalCounsel: '',
    fundAdmin: '',
    taxPartner: '',
    auditPartner: '',
    complianceOther: '',
  });

  useEffect(() => {
    async function loadApplication() {
      try {
        const res = await gpApplicationsApi.getMy();
        const app: GpApplication = res.data.application;
        setApplication(app);
        setStep1Form((prev) => ({
          ...prev,
          companyName: app.companyName ?? '',
          primaryContactName: app.primaryContactName ?? '',
          primaryContactEmail: app.primaryContactEmail ?? '',
          primaryContactPhone: app.primaryContactPhone ?? '',
          companyWebsite: app.companyWebsite ?? '',
          headquarters: app.headquarters ?? '',
          yearFounded: app.yearFounded ?? '',
          legalStructure: app.legalStructure ?? '',
        }));

        if (app.strategy) {
          setStep2Form((prev) => ({
            ...prev,
            investmentThesis: app.strategy?.investmentThesis ?? '',
            geographicFocus: (app.strategy?.geographies ?? []).join(', '),
            targetFundSize:
              app.strategy?.fundSize !== undefined ? String(app.strategy.fundSize) : '',
            // Map some strategy fields back into firm history / fundraising summary text
            totalCommittedCapital: '',
            firstInvestmentYear: '',
            numberOfBlindPoolFunds:
              app.strategy?.previousFundCount !== undefined
                ? String(app.strategy.previousFundCount)
                : '',
            numberOfSpvs:
              app.strategy?.numberOfDeals !== undefined
                ? String(app.strategy.numberOfDeals)
                : '',
          }));
        }
      } catch {
        toast.error('Unable to load your application. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, []);

  const handleStep1Change =
    (field: keyof GpStep1Payload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setStep1Form((prev) => ({ ...prev, [field]: value }));
    };

  const handleStep2Change =
    (field: keyof Step2FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setStep2Form((prev) => ({ ...prev, [field]: value }));
    };

  const toggleInvestmentStage = (stage: string) => {
    setStep2Form((prev) => ({
      ...prev,
      investmentStages: prev.investmentStages.includes(stage)
        ? prev.investmentStages.filter((s) => s !== stage)
        : [...prev.investmentStages, stage],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!application?._id) {
      toast.error('Application not found.');
      return;
    }

    setSaving(true);
    try {
      let payload: unknown = {};

      if (currentStep === 1) {
        payload = step1Form;
      } else if (currentStep === 2) {
        const geographies = step2Form.geographicFocus
          ? step2Form.geographicFocus.split(',').map((g) => g.trim()).filter(Boolean)
          : [];

        payload = {
          strategy: {
            investmentThesis: step2Form.investmentThesis || undefined,
            geographies: geographies.length ? geographies : undefined,
            fundSize:
              step2Form.targetFundSize && !Number.isNaN(Number(step2Form.targetFundSize))
                ? Number(step2Form.targetFundSize)
                : undefined,
            assetClasses: step2Form.investmentStages,
            previousFundCount:
              step2Form.numberOfBlindPoolFunds &&
              !Number.isNaN(Number(step2Form.numberOfBlindPoolFunds))
                ? Number(step2Form.numberOfBlindPoolFunds)
                : undefined,
            numberOfDeals:
              step2Form.numberOfSpvs && !Number.isNaN(Number(step2Form.numberOfSpvs))
                ? Number(step2Form.numberOfSpvs)
                : undefined,
            trackRecordSummary: [
              step2Form.totalCommittedCapital && `Total committed capital: ${step2Form.totalCommittedCapital}`,
              step2Form.firstInvestmentYear && `First investment year: ${step2Form.firstInvestmentYear}`,
              step2Form.fundraisingStatus && `Fundraising status: ${step2Form.fundraisingStatus}`,
              step2Form.minCheckSize && `Min check size: ${step2Form.minCheckSize}`,
              step2Form.expectedFinalClose && `Expected final close: ${step2Form.expectedFinalClose}`,
              step2Form.legalCounsel && `Legal counsel: ${step2Form.legalCounsel}`,
              step2Form.fundAdmin && `Fund admin: ${step2Form.fundAdmin}`,
              step2Form.taxPartner && `Tax partner: ${step2Form.taxPartner}`,
              step2Form.auditPartner && `Audit partner: ${step2Form.auditPartner}`,
              step2Form.complianceOther && `Compliance / other: ${step2Form.complianceOther}`,
            ]
              .filter(Boolean)
              .join(' | '),
          },
        };
      }

      await gpApplicationsApi.saveStep(application._id, currentStep, payload);
      toast.success(`Step ${currentStep} saved.`);
      const nextStep = Math.min(currentStep + 1, 4);
      router.push(`/apply/step/${nextStep}`);
    } catch (err) {
      const message =
        (typeof err === 'object' &&
          err !== null &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err as any)?.response?.data?.message) ||
        'Failed to save this step. Please check your details.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch justify-center py-10">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Step navigation (top on mobile, left on desktop) */}
        <aside className="w-full md:w-64 bg-slate-900 text-white flex md:flex-col items-start md:items-stretch px-6 md:px-8 py-5 md:py-10 gap-4 md:gap-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-slate-400">Raise</p>
            <p className="mt-4 text-sm font-semibold text-slate-100">
              GP Application &mdash; Step {currentStep} of 4
            </p>
          </div>

          <ol className="flex md:block gap-4 md:gap-0 md:space-y-5 text-sm overflow-x-auto md:overflow-visible w-full">
            <li className={currentStep === 1 ? 'flex items-center gap-3' : 'flex items-center gap-3 text-slate-400'}>
              <span
                className={
                  currentStep === 1
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold'
                    : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-500 text-xs font-semibold'
                }
              >
                1
              </span>
              <span className={currentStep === 1 ? 'font-semibold text-slate-50 whitespace-nowrap' : 'whitespace-nowrap'}>
                Welcome &amp; Company
              </span>
            </li>
            <li className={currentStep === 2 ? 'flex items-center gap-3' : 'flex items-center gap-3 text-slate-400'}>
              <span
                className={
                  currentStep === 2
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold'
                    : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-500 text-xs font-semibold'
                }
              >
                2
              </span>
              <span className={currentStep === 2 ? 'font-semibold text-slate-50 whitespace-nowrap' : 'whitespace-nowrap'}>
                Team
              </span>
            </li>
            <li className={currentStep === 3 ? 'flex items-center gap-3' : 'flex items-center gap-3 text-slate-400'}>
              <span
                className={
                  currentStep === 3
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold'
                    : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-500 text-xs font-semibold'
                }
              >
                3
              </span>
              <span className={currentStep === 3 ? 'font-semibold text-slate-50 whitespace-nowrap' : 'whitespace-nowrap'}>
                Strategy
              </span>
            </li>
            <li className={currentStep === 4 ? 'flex items-center gap-3' : 'flex items-center gap-3 text-slate-400'}>
              <span
                className={
                  currentStep === 4
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold'
                    : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-500 text-xs font-semibold'
                }
              >
                4
              </span>
              <span className={currentStep === 4 ? 'font-semibold text-slate-50 whitespace-nowrap' : 'whitespace-nowrap'}>
                Assets &amp; Uploads
              </span>
            </li>
          </ol>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-slate-50 relative">
          {/* Header */}
          <header className="px-8 lg:px-10 pt-8 pb-6 border-b border-slate-200 flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                GP Application &mdash; Step {currentStep}
              </p>
              <h1 className="mt-2 text-xl lg:text-2xl font-semibold text-slate-900">
                Welcome to Raise
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Tell us about your firm and primary contact. You can save this page and come back
                to complete your application later.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500 mb-1">Progress</p>
              <p className="text-sm font-medium text-slate-900">
                Page {currentStep} of 4
              </p>
            </div>
          </header>

          {/* Form body */}
          <form
            onSubmit={handleSubmit}
            className="px-6 lg:px-10 pt-6 pb-28 space-y-10 overflow-y-auto max-h-[calc(100vh-5rem)]"
          >
            {/* STEP 1 CONTENT */}
            {currentStep === 1 && (
              <>
            {/* 1. Referred by */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                  1
                </span>
                <h2 className="text-sm font-semibold text-slate-800">Referred by (optional)</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Referred by
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name and email of your referrer"
                />
              </div>
            </section>

            {/* 2. Primary contact */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                  2
                </span>
                <h2 className="text-sm font-semibold text-slate-800">Primary contact</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Primary contact name
                  </label>
                  <input
                    type="text"
                    value={step1Form.primaryContactName ?? ''}
                    onChange={handleStep1Change('primaryContactName')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={step1Form.primaryContactEmail ?? ''}
                    onChange={handleStep1Change('primaryContactEmail')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={step1Form.primaryContactPhone ?? ''}
                    onChange={handleStep1Change('primaryContactPhone')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </section>

            {/* 3. Company info */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                  3
                </span>
                <h2 className="text-sm font-semibold text-slate-800">Company info</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={step1Form.companyName ?? ''}
                    onChange={handleStep1Change('companyName')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Act One Ventures"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Company website
                  </label>
                  <input
                    type="url"
                    value={step1Form.companyWebsite ?? ''}
                    onChange={handleStep1Change('companyWebsite')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourfund.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={step1Form.headquarters ?? ''}
                    onChange={handleStep1Change('headquarters')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Year founded
                  </label>
                  <input
                    type="number"
                    value={step1Form.yearFounded ?? ''}
                    onChange={handleStep1Change('yearFounded')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2016"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Legal structure
                  </label>
                  <input
                    type="text"
                    value={step1Form.legalStructure ?? ''}
                    onChange={handleStep1Change('legalStructure')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Limited Partnership"
                  />
                </div>
              </div>
            </section>

            {/* 4. Investing partners (visual-only for Step 1, data captured in later steps) */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                  4
                </span>
                <h2 className="text-sm font-semibold text-slate-800">Investing partners</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs text-slate-500">
                  We&apos;ll ask for detailed investing partner composition and diversity information
                  in the next steps of your application.
                </p>
              </div>
            </section>
              </>
            )}

            {/* STEP 2 CONTENT */}
            {currentStep === 2 && (
              <>
                {/* Section 1: Investment Strategy */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                        1
                      </span>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Section 1: Investment Strategy
                      </h2>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Investment stages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Accelerator', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Stage Agnostic'].map(
                          (stage) => {
                            const selected = step2Form.investmentStages.includes(stage);
                            return (
                              <button
                                key={stage}
                                type="button"
                                onClick={() => toggleInvestmentStage(stage)}
                                className={
                                  selected
                                    ? 'px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500 text-white shadow-sm'
                                    : 'px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }
                              >
                                {stage}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Investment thesis
                        </label>
                        <textarea
                          value={step2Form.investmentThesis}
                          onChange={handleStep2Change('investmentThesis')}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Select primary themes or describe your thesis..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Geographic focus details
                        </label>
                        <textarea
                          value={step2Form.geographicFocus}
                          onChange={handleStep2Change('geographicFocus')}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Specify key markets (e.g., North America, SE Asia, Western Europe)..."
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Firm History */}
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                      2
                    </span>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Section 2: Firm History
                    </h2>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Total committed capital ($M)
                      </label>
                      <input
                        type="number"
                        value={step2Form.totalCommittedCapital}
                        onChange={handleStep2Change('totalCommittedCapital')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="$ 0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        First investment year
                      </label>
                      <input
                        type="number"
                        value={step2Form.firstInvestmentYear}
                        onChange={handleStep2Change('firstInvestmentYear')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Number of blind pool funds
                      </label>
                      <input
                        type="number"
                        value={step2Form.numberOfBlindPoolFunds}
                        onChange={handleStep2Change('numberOfBlindPoolFunds')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Number of SPVs
                      </label>
                      <input
                        type="number"
                        value={step2Form.numberOfSpvs}
                        onChange={handleStep2Change('numberOfSpvs')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 3: Fundraising */}
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                      3
                    </span>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Section 3: Fundraising
                    </h2>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Fundraising status
                      </label>
                      <input
                        type="text"
                        value={step2Form.fundraisingStatus}
                        onChange={handleStep2Change('fundraisingStatus')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="In market (open), Soft circled, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Target fund size ($M)
                      </label>
                      <input
                        type="number"
                        value={step2Form.targetFundSize}
                        onChange={handleStep2Change('targetFundSize')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="$ 0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Min check size
                      </label>
                      <input
                        type="text"
                        value={step2Form.minCheckSize}
                        onChange={handleStep2Change('minCheckSize')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="$250k – $500k"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Expected final close
                      </label>
                      <input
                        type="text"
                        value={step2Form.expectedFinalClose}
                        onChange={handleStep2Change('expectedFinalClose')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Q1 2025"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 4: Service Providers */}
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                      4
                    </span>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Section 4: Service Providers
                    </h2>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Legal counsel
                      </label>
                      <input
                        type="text"
                        value={step2Form.legalCounsel}
                        onChange={handleStep2Change('legalCounsel')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Wilson Sonsini"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Fund admin
                      </label>
                      <input
                        type="text"
                        value={step2Form.fundAdmin}
                        onChange={handleStep2Change('fundAdmin')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Carta, Passthrough"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Tax partner
                      </label>
                      <input
                        type="text"
                        value={step2Form.taxPartner}
                        onChange={handleStep2Change('taxPartner')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., PwC, Deloitte"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Audit partner
                      </label>
                      <input
                        type="text"
                        value={step2Form.auditPartner}
                        onChange={handleStep2Change('auditPartner')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., KPMG"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Compliance / other
                      </label>
                      <input
                        type="text"
                        value={step2Form.complianceOther}
                        onChange={handleStep2Change('complianceOther')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Other key service providers"
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {loading && (
              <p className="text-xs text-slate-400">Loading your existing details…</p>
            )}
          </form>

          {/* Bottom sticky bar */}
          <div className="absolute inset-x-0 bottom-0 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between px-6 lg:px-10 py-4 gap-3">
            <p className="text-xs md:text-sm text-slate-200 max-w-xl">
              Ready for the next step? You can always return to this page to edit your answers
              before you submit.
            </p>
            <button
              type="submit"
              formAction=""
              onClick={(e) => {
                const formEl = (e.currentTarget.ownerDocument || document).querySelector(
                  'form'
                ) as HTMLFormElement | null;
                if (formEl) {
                  formEl.requestSubmit();
                }
              }}
              disabled={saving || loading}
              className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold shadow-sm hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving…' : `Save & continue to page ${Math.min(currentStep + 1, 4)}`}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

