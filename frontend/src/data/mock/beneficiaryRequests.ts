import type { LifecycleStage } from "@/data/constants/lifecycle";
import type { AssistanceRequest } from "@/types/request";

export type BeneficiaryStatus = "under review" | "approved" | "fulfilled";

export type BeneficiaryRequest = {
  id: number;
  reference: string;
  title: string;
  category: string;
  location: string;
  status: BeneficiaryStatus;
  stage: LifecycleStage;
  summary: string;
  resource: string;
  quantity: number;
  urgency: "Low" | "Medium" | "High";
  submittedOn: string;
  organizationId: number | null;
};

export function statusFromStage(stage: LifecycleStage | string): BeneficiaryStatus {
  if (stage === "Need identified") return "under review";
  if (stage === "Confirmed") return "fulfilled";
  return "approved";
}

export function mapAssistanceRequest(request: AssistanceRequest): BeneficiaryRequest {
  const submitted = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id: request.id,
    reference: request.reference || `REQ-${request.id}`,
    title: request.title,
    category: request.category,
    location: request.county,
    status: statusFromStage(request.stage),
    stage: request.stage,
    summary: request.summary,
    resource: request.resource,
    quantity: request.quantity,
    urgency: request.urgency,
    submittedOn: submitted,
    organizationId: request.organizationId,
  };
}

export type AssistanceStep = {
  title: string;
  detail: string;
  done: boolean;
  body: string;
};

export type TrackingStep = {
  title: string;
  detail: string;
  done: boolean;
};

export const assistanceProcess: AssistanceStep[] = [
  {
    title: "Submit request",
    detail: "Completed in fictional scenario",
    done: true,
    body: "A beneficiary describes the support needed. In this demonstration, that step is already complete.",
  },
  {
    title: "Agency review",
    detail: "Completed in fictional scenario",
    done: true,
    body: "A participating organization reviews the request. In this demonstration, that review is already recorded.",
  },
  {
    title: "Approval decision",
    detail: "Not yet completed",
    done: false,
    body: "The organization records whether support can proceed. This step is still open in the demonstration scenario.",
  },
  {
    title: "Support coordination",
    detail: "Not yet completed",
    done: false,
    body: "Resources are matched and a handover is arranged. Nothing has been coordinated in this scenario yet.",
  },
  {
    title: "Delivery confirmation",
    detail: "Not yet completed",
    done: false,
    body: "The beneficiary confirms that support arrived. No delivery has been confirmed in this scenario yet.",
  },
];

export const trackingJourney: TrackingStep[] = [
  { title: "Request submitted", detail: "Completed in fictional scenario", done: true },
  { title: "Agency review started", detail: "Completed in fictional scenario", done: true },
  { title: "Assessment decision", detail: "Completed in fictional scenario", done: true },
  { title: "Approved for discovery", detail: "Completed in fictional scenario", done: true },
  { title: "Donor pledge recorded", detail: "Not yet completed", done: false },
  { title: "Resources coordinated", detail: "Not yet completed", done: false },
  { title: "Delivery confirmed", detail: "Not yet completed", done: false },
];

export const requestCategories = [
  "Education",
  "Food Security",
  "Healthcare",
  "Shelter",
  "Community Development",
  "Community Support",
] as const;

export const requestUrgencies = ["Low", "Medium", "High"] as const;

export const deliveryOutcomes = [
  "Yes, everything was received",
  "Partially received",
  "Not received",
  "Report a discrepancy",
] as const;

export function requestStats(requests: BeneficiaryRequest[]) {
  return {
    total: requests.length,
    underReview: requests.filter((request) => request.status === "under review").length,
    approved: requests.filter((request) => request.status === "approved").length,
    fulfilled: requests.filter((request) => request.status === "fulfilled").length,
  };
}

export function deliveryLabel(request: BeneficiaryRequest, index: number) {
  return `DEL-${String(index + 1).padStart(3, "0")} · ${request.resource}`;
}

export function trackingStepsFor(status: BeneficiaryStatus): TrackingStep[] {
  if (status === "fulfilled") {
    return trackingJourney.map((step) => ({ ...step, done: true, detail: "Completed in fictional scenario" }));
  }
  if (status === "under review") {
    return trackingJourney.map((step, index) => ({
      ...step,
      done: index < 2,
      detail: index < 2 ? "Completed in fictional scenario" : "Not yet completed",
    }));
  }
  return trackingJourney;
}
