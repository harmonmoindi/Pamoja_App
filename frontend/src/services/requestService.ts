import { api, Page } from "@/lib/apiClient";
import {
  AssistanceRequest,
  AssistanceRequestCreate,
  ReceiptConfirmation,
  ReceiptCreate,
} from "@/types/request";

export const createRequest = (body: AssistanceRequestCreate) =>
  api<{ request: AssistanceRequest }>("/requests", { method: "POST", body });

export const myRequests = () => api<Page<AssistanceRequest>>("/requests/mine");

export const getRequest = (requestId: number) =>
  api<{ request: AssistanceRequest }>(`/requests/${requestId}`);

export const confirmReceipt = (body: ReceiptCreate) =>
  api<{ receipt: ReceiptConfirmation }>("/receipts", { method: "POST", body });
