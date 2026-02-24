"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { gpApplicationsApi } from "@/lib/api";
import SubmissionSuccess from "@/components/apllicationSteps/SubmissionSuccess";
import StepOne from "@/components/apllicationSteps/StepOne";
import StepTwo from "@/components/apllicationSteps/StepTwo";
import StepThree from "@/components/apllicationSteps/StepThree";
import StepFour from "@/components/apllicationSteps/StepFour";
import StepFive from "@/components/apllicationSteps/StepFive";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step1State = {
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

type Step2State = {
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

type Step3State = {
  firmType: "existing" | "new";
  notes: string;
};

type Step4State = {
  company1Name: string;
  company1Website: string;
};

type Step5State = {
  databaseOpt: "public" | "private";
  headline: string;
  summary: string;
  allowDeck: boolean;
  allowTrack: boolean;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
const defaultStep1: Step1State = {
  companyName: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  companyWebsite: "",
  headquarters: "",
  yearFounded: "",
  legalStructure: "",
  referredBy: "",
  partnerBackground: "",
  menPartners: "0",
  womenPartners: "0",
  otherGenderPartners: "0",
  racialIdentities: [],
  ownershipMen: "",
  ownershipWomen: "",
  ownershipWhite: "",
  ownershipBipoc: "",
  includeVeterans: false,
  includeLgbtq: false,
};

const defaultStep2: Step2State = {
  investmentStages: [],
  investmentThesis: "",
  globalFocus: "yes",
  geographicFocus: "",
  totalCommittedCapital: "",
  firstInvestmentYear: "",
  numberOfBlindPoolFunds: "",
  numberOfSpvs: "",
  fundraisingStatus: "open",
  targetFundSize: "",
  minCheckSize: "250-500",
  expectedFinalClose: "Q2 2025",
  legalCounsel: "",
  fundAdmin: "",
  taxPartner: "",
  auditPartner: "",
  complianceOther: "",
};

const defaultStep3: Step3State = { firmType: "existing", notes: "" };
const defaultStep4: Step4State = { company1Name: "", company1Website: "" };
const defaultStep5: Step5State = {
  databaseOpt: "public",
  headline: "",
  summary: "",
  allowDeck: true,
  allowTrack: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mergeWithDefaults<T extends object>(defaults: T, saved: unknown): T {
  if (!saved || typeof saved !== "object") return defaults;
  return { ...defaults, ...(saved as Partial<T>) };
}

// ─── Resume Popup ─────────────────────────────────────────────────────────────
function ResumePopup({
  lastStep,
  onContinue,
  onStartNew,
}: {
  lastStep: number;
  onContinue: () => void;
  onStartNew: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-blue-600"
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
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            You have a draft in progress
          </h2>
        </div>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          You left off on <strong>Step {lastStep}</strong>. Would you like to
          continue where you left off, or start a brand new application?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue from Step {lastStep}
          </button>
          <button
            onClick={onStartNew}
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Start New Application
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Reset Popup ──────────────────────────────────────────────────────
function ConfirmResetPopup({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-red-600"
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
          <h2 className="text-xl font-bold text-gray-900">
            Are you absolutely sure?
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">
            ⚠️ This will permanently delete all your current application data.
            This action is irreversible and cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Keep My Data
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Yes, Start New
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplyStepPage() {
  const router = useRouter();
  const routeParams = useParams();
  const stepParam = routeParams?.step as string | undefined;
  const rawStep = Number(stepParam ?? "1");
  const currentStep = Number.isFinite(rawStep)
    ? Math.min(Math.max(rawStep, 1), 6)
    : 1;

  // Application ID from backend
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Popup state
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resumeStep, setResumeStep] = useState(1);

  // Form states
  const [step1, setStep1] = useState<Step1State>(defaultStep1);
  const [step2, setStep2] = useState<Step2State>(defaultStep2);
  const [step3, setStep3] = useState<Step3State>(defaultStep3);
  const [step4, setStep4] = useState<Step4State>(defaultStep4);
  const [step5, setStep5] = useState<Step5State>(defaultStep5);

  // ─── Load application on mount ───────────────────────────────────────────
  const loadApplication = useCallback(
    async (skipPopup = false) => {
      try {
        const res = await gpApplicationsApi.getMy();
        const app = res.data.application;
        setApplicationId(app._id);

        // Pre-fill form states from saved stepData
        const sd = app.stepData || {};
        if (sd.step1Data)
          setStep1(mergeWithDefaults(defaultStep1, sd.step1Data));
        if (sd.step2Data)
          setStep2(mergeWithDefaults(defaultStep2, sd.step2Data));
        if (sd.step3Data)
          setStep3(mergeWithDefaults(defaultStep3, sd.step3Data));
        if (sd.step4Data)
          setStep4(mergeWithDefaults(defaultStep4, sd.step4Data));
        if (sd.step5Data)
          setStep5(mergeWithDefaults(defaultStep5, sd.step5Data));

        const lastStep = app.stepStatus?.lastCompletedStep || 0;

        // Show resume popup only if user is on step 1 (initial load) and has progress
        if (!skipPopup && lastStep > 0 && currentStep === 1) {
          setResumeStep(Math.min(lastStep + 1, 5));
          setShowResumePopup(true);
        }
      } catch {
        // No existing application — create one
        try {
          const res = await gpApplicationsApi.createOrGet();
          setApplicationId(res.data.application._id);
        } catch (err) {
          toast.error("Failed to initialize application. Please refresh.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentStep],
  );

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Resume popup handlers ────────────────────────────────────────────────
  const handleContinue = () => {
    setShowResumePopup(false);
    router.push(`/apply/step/${resumeStep}`);
  };

  const handleStartNewClick = () => {
    setShowResumePopup(false);
    setShowConfirmReset(true);
  };

  const handleConfirmReset = async () => {
    setShowConfirmReset(false);
    try {
      const res = await gpApplicationsApi.reset();
      const app = res.data.application;
      setApplicationId(app._id);
      setStep1(defaultStep1);
      setStep2(defaultStep2);
      setStep3(defaultStep3);
      setStep4(defaultStep4);
      setStep5(defaultStep5);
      toast.success("Previous application cleared. Starting fresh!");
      router.push("/apply/step/1");
    } catch {
      toast.error("Failed to reset application.");
    }
  };

  // ─── Save step to API & navigate forward ─────────────────────────────────
  const handleSaveAndNext = async (step: number, data: unknown) => {
    if (!applicationId) {
      toast.error("Application not initialized.");
      return;
    }
    setSaving(true);
    try {
      await gpApplicationsApi.saveStep(applicationId, step, data);
      const next = Math.min(step + 1, 6);
      router.push(`/apply/step/${next}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save. Please try again.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Final submit ─────────────────────────────────────────────────────────
  const handleFinalSubmit = async (step5Data: Step5State) => {
    if (!applicationId) return;
    setSaving(true);
    try {
      // Save step 5 data first
      await gpApplicationsApi.saveStep(applicationId, 5, step5Data);
      // Then submit
      await gpApplicationsApi.submit(applicationId);
      router.push("/apply/step/6");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Submission failed. Please try again.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Back navigation ─────────────────────────────────────────────────────
  const handleBack = () => {
    const prev = Math.max(currentStep - 1, 1);
    router.push(`/apply/step/${prev}`);
  };

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">
            Loading your application…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resume Popup */}
      {showResumePopup && (
        <ResumePopup
          lastStep={resumeStep}
          onContinue={handleContinue}
          onStartNew={handleStartNewClick}
        />
      )}

      {/* Confirm Reset Popup */}
      {showConfirmReset && (
        <ConfirmResetPopup
          onConfirm={handleConfirmReset}
          onCancel={() => setShowConfirmReset(false)}
        />
      )}

      {currentStep === 1 && (
        <StepOne
          form={step1}
          onChange={(f, v) => setStep1((prev) => ({ ...prev, [f]: v }))}
          onNext={() => handleSaveAndNext(1, step1)}
          saving={saving}
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          form={step2}
          onChange={(f, v) =>
            setStep2((prev) => ({ ...prev, [f]: v as string }))
          }
          toggleStage={(stage: string) =>
            setStep2((prev) => ({
              ...prev,
              investmentStages: prev.investmentStages.includes(stage)
                ? prev.investmentStages.filter((s) => s !== stage)
                : [...prev.investmentStages, stage],
            }))
          }
          onNext={() => handleSaveAndNext(2, step2)}
          onBack={handleBack}
          saving={saving}
        />
      )}
      {currentStep === 3 && (
        <StepThree
          form={step3}
          onChange={(f, v) => setStep3((prev) => ({ ...prev, [f]: v }))}
          onNext={() => handleSaveAndNext(3, step3)}
          onBack={handleBack}
          saving={saving}
        />
      )}
      {currentStep === 4 && (
        <StepFour
          form={step4}
          onChange={(f, v) => setStep4((prev) => ({ ...prev, [f]: v }))}
          onNext={() => handleSaveAndNext(4, step4)}
          onBack={handleBack}
          saving={saving}
        />
      )}
      {currentStep === 5 && (
        <StepFive
          form={step5}
          onChange={(f, v) =>
            setStep5((prev) => ({ ...prev, [f]: v as boolean | string }))
          }
          onNext={() => handleFinalSubmit(step5)}
          onBack={handleBack}
          saving={saving}
        />
      )}
      {currentStep === 6 && <SubmissionSuccess />}
    </>
  );
}
