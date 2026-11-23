import { LifecycleStage } from "@/data/constants/lifecycle";

export type RequestUrgency = "Low" | "Medium" | "High";

export type ReceiptOutcome = "complete" | "partial" | "not_received" | "discrepancy";

export interface AssistanceRequest {
  id: number;
  reference: string | null;
  beneficiaryId: number;
  organizationId: number | null;
  title: string;
  category: string;
  county: string;
  summary: string;
  resource: string;
  quantity: number;
  allocated: number;
  unit: string;
  urgency: RequestUrgency;
  stage: LifecycleStage;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssistanceRequestCreate = {
  title: string;
  category: string;
  county: string;
  summary: string;
  resource: string;
  quantity: number;
  unit?: string;
  urgency?: RequestUrgency;
  organizationId?: number | null;
};

export interface ReceiptConfirmation {
  id: number;
  deliveryId: number;
  requestId: number;
  beneficiaryId: number;
  outcome: ReceiptOutcome;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptCreate = {
  deliveryId: number;
  outcome: ReceiptOutcome;
  comments?: string | null;
};
