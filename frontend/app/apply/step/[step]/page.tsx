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

  // Form states
  const [step1, setStep1] = useState<Step1State>(defaultStep1);
  const [step2, setStep2] = useState<Step2State>(defaultStep2);
  const [step3, setStep3] = useState<Step3State>(defaultStep3);
  const [step4, setStep4] = useState<Step4State>(defaultStep4);
  const [step5, setStep5] = useState<Step5State>(defaultStep5);

  // ─── Load application on mount ───────────────────────────────────────────
  const loadApplication = useCallback(async () => {
    try {
      const res = await gpApplicationsApi.getMy();
      const app = res.data.application;

      // If own application is already submitted → show the submitted screen
      if (res.data.submitted || app.applicantProgressStatus === "submitted") {
        const companyName = app.stepData?.step1Data?.companyName || "";
        router.replace(
          `/apply/submitted?companyName=${encodeURIComponent(companyName)}`,
        );
        return;
      }

      setApplicationId(app._id);

      // Pre-fill form states from saved stepData
      const sd = app.stepData || {};
      if (sd.step1Data) setStep1(mergeWithDefaults(defaultStep1, sd.step1Data));
      if (sd.step2Data) setStep2(mergeWithDefaults(defaultStep2, sd.step2Data));
      if (sd.step3Data) setStep3(mergeWithDefaults(defaultStep3, sd.step3Data));
      if (sd.step4Data) setStep4(mergeWithDefaults(defaultStep4, sd.step4Data));
      if (sd.step5Data) setStep5(mergeWithDefaults(defaultStep5, sd.step5Data));

      const lastStep = app.stepStatus?.lastCompletedStep || 0;

      // Redirect to resume page if user has progress (only on step 1 initial load)
      if (lastStep > 0 && currentStep === 1) {
        const companyName = app.stepData?.step1Data?.companyName || "";
        router.replace(
          `/apply/resume?appId=${app._id}&lastStep=${lastStep}&companyName=${encodeURIComponent(companyName)}`,
        );
        return;
      }
    } catch (err: unknown) {
      const errAny = err as {
        response?: {
          status?: number;
          data?: {
            conflict?: boolean;
            pendingRequest?: boolean;
            applicationSubmitted?: boolean;
            existingApplication?: {
              _id?: string;
              stepData?: { step1Data?: { companyName?: string } };
            };
            ownerUser?: { name?: string; email?: string };
          };
        };
      };

      // 409 = domain conflict: another user from same domain has an application
      if (
        errAny?.response?.status === 409 &&
        errAny?.response?.data?.conflict
      ) {
        const {
          existingApplication,
          ownerUser,
          pendingRequest,
          applicationSubmitted,
        } = errAny.response.data;
        const appId = existingApplication?._id ?? "";
        const ownerName =
          ownerUser?.name || ownerUser?.email || "your colleague";
        const companyName =
          existingApplication?.stepData?.step1Data?.companyName || "";
        const pendingParam = pendingRequest ? "&pending=true" : "";
        const submittedParam = applicationSubmitted ? "&submitted=true" : "";
        router.replace(
          `/apply/conflict?appId=${appId}&ownerName=${encodeURIComponent(ownerName)}&companyName=${encodeURIComponent(companyName)}${pendingParam}${submittedParam}`,
        );
        return;
      }

      // 404 = no application yet — create one
      if (errAny?.response?.status === 404) {
        try {
          const res = await gpApplicationsApi.createOrGet();

          // createOrGet can also return 409 conflict
          const createErr = res.data;
          if (createErr?.conflict) {
            const appId = createErr.existingApplication?._id ?? "";
            const ownerName =
              (createErr.ownerUser as { name?: string; email?: string })
                ?.name ||
              (createErr.ownerUser as { name?: string; email?: string })
                ?.email ||
              "your colleague";
            const companyName =
              (
                createErr.existingApplication as {
                  stepData?: { step1Data?: { companyName?: string } };
                }
              )?.stepData?.step1Data?.companyName || "";
            const pendingParam = (createErr as { pendingRequest?: boolean })
              ?.pendingRequest
              ? "&pending=true"
              : "";
            const submittedParam = (
              createErr as { applicationSubmitted?: boolean }
            )?.applicationSubmitted
              ? "&submitted=true"
              : "";
            router.replace(
              `/apply/conflict?appId=${appId}&ownerName=${encodeURIComponent(ownerName)}&companyName=${encodeURIComponent(companyName)}${pendingParam}${submittedParam}`,
            );
            return;
          }

          setApplicationId(res.data.application._id);
        } catch (createErr: unknown) {
          const createErrAny = createErr as {
            response?: {
              data?: {
                conflict?: boolean;
                pendingRequest?: boolean;
                existingApplication?: { _id?: string };
                ownerUser?: { name?: string };
              };
            };
          };
          if (createErrAny?.response?.data?.conflict) {
            const appId =
              createErrAny.response?.data?.existingApplication?._id ?? "";
            const ownerUser = createErrAny.response?.data?.ownerUser as
              | { name?: string; email?: string }
              | undefined;
            const existingApp = createErrAny.response?.data
              ?.existingApplication as
              | {
                  _id?: string;
                  stepData?: { step1Data?: { companyName?: string } };
                }
              | undefined;
            const ownerName =
              ownerUser?.name || ownerUser?.email || "your colleague";
            const companyName =
              existingApp?.stepData?.step1Data?.companyName || "";
            const pendingParam = (
              createErrAny.response?.data as { pendingRequest?: boolean }
            )?.pendingRequest
              ? "&pending=true"
              : "";
            const submittedParam = (
              createErrAny.response?.data as { applicationSubmitted?: boolean }
            )?.applicationSubmitted
              ? "&submitted=true"
              : "";
            router.replace(
              `/apply/conflict?appId=${appId}&ownerName=${encodeURIComponent(ownerName)}&companyName=${encodeURIComponent(companyName)}${pendingParam}${submittedParam}`,
            );
            return;
          }
          toast.error("Failed to initialize application. Please refresh.");
          console.error(createErr);
        }
        return;
      }

      toast.error("Failed to load application. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentStep, router]);

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
