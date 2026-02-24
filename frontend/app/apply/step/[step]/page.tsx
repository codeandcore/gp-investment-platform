"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { gpApplicationsApi, GpStep1Payload } from "@/lib/api";
import SubmissionSuccess from "@/components/apllicationSteps/SubmissionSuccess";
import StepOne from "@/components/apllicationSteps/StepOne";
import StepTwo from "@/components/apllicationSteps/StepTwo";
import StepThree from "@/components/apllicationSteps/StepThree";
import StepFour from "@/components/apllicationSteps/StepFour";
import StepFive from "@/components/apllicationSteps/StepFive";

interface ApplyStepPageProps {
  params: { step: string };
}

export default function ApplyStepPage({ params }: ApplyStepPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const stepParam = routeParams?.step as string | undefined;
  const rawStep = Number(stepParam ?? "1");
  const currentStep = Number.isFinite(rawStep)
    ? Math.min(Math.max(rawStep, 1), 6)
    : 1;

  const [stepOneFormState, setStepOneFormState] = useState<GpStep1Payload>({
    companyName: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    companyWebsite: "",
    headquarters: "",
    yearFounded: "",
    legalStructure: "",
  });

  type Step2FormStateLocal = {
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
  };

  const [stepTwoFormState, setStepTwoFormState] = useState<Step2FormStateLocal>({
    investmentStages: [],
    investmentThesis: "",
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
  });

  type Step3FormStateLocal = { firmType: "existing" | "new"; notes: string };
  const [stepThreeFormState, setStepThreeFormState] = useState<Step3FormStateLocal>({ firmType: "existing", notes: "" });

  type Step4FormStateLocal = { company1Name: string; company1Website: string };
  const [stepFourFormState, setStepFourFormState] = useState<Step4FormStateLocal>({ company1Name: "", company1Website: "" });

  type Step5FormStateLocal = {
    databaseOpt: "public" | "private";
    headline: string;
    summary: string;
    allowDeck: boolean;
    allowTrack: boolean;
  };
  const [stepFiveFormState, setStepFiveFormState] = useState<Step5FormStateLocal>({
    databaseOpt: "public",
    headline: "",
    summary: "",
    allowDeck: true,
    allowTrack: false,
  });

  const handleStepOneChange = (field: keyof typeof stepOneFormState, value: string) =>
    setStepOneFormState((prev) => ({ ...prev, [field]: value }));

  const handleStepTwoChange = (field: keyof Step2FormStateLocal, value: string) =>
    setStepTwoFormState((prev) => ({ ...prev, [field]: value }));
  const toggleStage = (stage: string) =>
    setStepTwoFormState((prev) => ({
      ...prev,
      investmentStages: prev.investmentStages.includes(stage)
        ? prev.investmentStages.filter((s) => s !== stage)
        : [...prev.investmentStages, stage],
    }));

  const handleStepThreeChange = (field: keyof Step3FormStateLocal, value: string) =>
    setStepThreeFormState((prev) => ({ ...prev, [field]: value }));
  const handleStepFourChange = (field: keyof Step4FormStateLocal, value: string) =>
    setStepFourFormState((prev) => ({ ...prev, [field]: value }));
  const handleStepFiveChange = (field: keyof Step5FormStateLocal, value: string | boolean) =>
    setStepFiveFormState((prev) => ({ ...prev, [field]: value as any }));

  return (
    <>
      {currentStep === 1 && (
        <StepOne
          form={{
            companyName: stepOneFormState.companyName || "",
            companyWebsite: stepOneFormState.companyWebsite || "",
            headquarters: stepOneFormState.headquarters || "",
            primaryContactEmail: stepOneFormState.primaryContactEmail || "",
          }}
          onChange={(f, v) => handleStepOneChange(f as keyof typeof stepOneFormState, v)}
          onNext={() => {
            const next = Math.min(currentStep + 1, 6);
            router.push(`/apply/step/${next}`);
          }}
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          form={stepTwoFormState}
          onChange={handleStepTwoChange}
          toggleStage={toggleStage}
          onNext={() => {
            const next = Math.min(currentStep + 1, 6);
            router.push(`/apply/step/${next}`);
          }}
        />
      )}
      {currentStep === 3 && (
        <StepThree
          form={stepThreeFormState}
          onChange={handleStepThreeChange}
          onNext={() => {
            const next = Math.min(currentStep + 1, 6);
            router.push(`/apply/step/${next}`);
          }}
        />
      )}
      {currentStep === 4 && (
        <StepFour
          form={stepFourFormState}
          onChange={handleStepFourChange}
          onNext={() => {
            const next = Math.min(currentStep + 1, 6);
            router.push(`/apply/step/${next}`);
          }}
        />
      )}
      {currentStep === 5 && (
        <StepFive
          form={stepFiveFormState}
          onChange={handleStepFiveChange}
          onNext={() => {
            const next = Math.min(currentStep + 1, 6);
            router.push(`/apply/step/${next}`);
          }}
        />
      )}
      {currentStep === 6 && <SubmissionSuccess />}
    </>
  );
}
