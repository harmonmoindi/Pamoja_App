import { api, type Page } from "@/lib/apiClient";
import type { AssistanceRequest } from "@/types/request";
import type { Opportunity } from "@/types/opportunity";

// ASSESSMENTS

export type AssessmentOutcome = "approved" | "rejected" | "needs_info";

export interface Assessment {
  id: number;
  requestId: number;
  assessorId: number;
  outcome: AssessmentOutcome;
  priority: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentInput {
  outcome: AssessmentOutcome;
  priority: string;
  notes?: string | null;
}

export const getAgencyRequests = (page = 1, perPage = 20) =>
  api<Page<AssistanceRequest>>("/requests", {
    params: { page, perPage },
  });

export const submitAssessment = (
  requestId: number,
  body: AssessmentInput
) =>
  api<{ assessment: Assessment }>(
    `/requests/${requestId}/assessment`,
    { method: "POST", body }
  );

// Publish an approved beneficiary request to the Donor Portal.
export const publishRequestOpportunity = (requestId: number) =>
  api<{ message: string; opportunity: Opportunity }>(
    `/opportunities/from-request/${requestId}`,
    { method: "POST" }
  );

// RESOURCE MATCHING

export interface ResourceMatch {
  resourceId: number;
  county: string;
  available: number;
  suggestedQuantity: number;
  sameCounty: boolean;
}

export interface MatchingResult {
  requestId: number;
  required: number;
  allocated: number;
  remaining: number;
  matches: ResourceMatch[];
}

export interface AllocationInput {
  requestId: number;
  resourceId: number;
  quantity: number;
}

export interface AllocationResult {
  message: string;
  requestId: number;
  resourceId: number;
  allocatedQuantity: number;
  totalAllocated: number;
  remaining: number;
  inventoryRemaining: number;
  available: number;
}

export const getResourceMatches = (requestId: number) =>
  api<MatchingResult>(`/matching/${requestId}`);

export const allocateResources = (body: AllocationInput) =>
  api<AllocationResult>("/matching/allocate", {
    method: "POST",
    body,
  });

// DELIVERY MANAGEMENT

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "failed";

export interface Delivery {
  id: number;
  reference: string | null;
  requestId: number;
  organizationId: number;
  pledgeId: number | null;
  status: DeliveryStatus;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryCreateInput {
  requestId: number;
  pledgeId?: number | null;
}

export const getDeliveries = (page = 1, perPage = 20) =>
  api<Page<Delivery>>("/deliveries", {
    params: { page, perPage },
  });

export const createDelivery = (body: DeliveryCreateInput) =>
  api<{ delivery: Delivery }>("/deliveries", {
    method: "POST",
    body,
  });

export const updateDeliveryStatus = (
  deliveryId: number,
  status: DeliveryStatus
) =>
  api<{ delivery: Delivery }>(`/deliveries/${deliveryId}`, {
    method: "PATCH",
    body: { status },
  });

// SITUATION REPORTS

export interface SituationReport {
  totalRequests: number;
  confirmedRequests: number;
  byStage: Record<string, number>;
  byCounty: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export const getSituationReport = () =>
  api<SituationReport>("/reports/situation");