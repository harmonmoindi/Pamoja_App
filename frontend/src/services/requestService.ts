import { api, Page } from "@/lib/apiClient";
import {
  AssistanceRequest,
  AssistanceRequestCreate,
  ReceiptConfirmation,
  ReceiptCreate,
  VerifiedOrganization,
} from "@/types/request";

export const createRequest = (body: AssistanceRequestCreate) =>
  api<{ request: AssistanceRequest }>("/requests", { method: "POST", body });

export const myRequests = () =>
  api<Page<AssistanceRequest>>("/requests/mine", { params: { perPage: 100 } });

export const getRequest = (requestId: number) =>
  api<{ request: AssistanceRequest }>(`/requests/${requestId}`);

export const listVerifiedOrganizations = () =>
  api<Page<VerifiedOrganization>>("/organizations/verified", {
    params: { perPage: 100 },
  });

export const myDeliveries = () =>
  api<Page<{ id: number; reference: string | null; requestId: number; status: string }>>(
    "/deliveries/mine",
    { params: { perPage: 100 } },
  );

export const confirmReceipt = (body: ReceiptCreate) =>
  api<{ receipt: ReceiptConfirmation }>("/receipts", { method: "POST", body });
