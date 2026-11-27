import { api } from "../lib/apiClient";
import type { Pledge } from "../types/pledge";

export interface CreatePledgeInput {
  opportunityId: number;
  type: "financial" | "in_kind";
  amount?: number;
  quantity?: number;
  paymentMethod?: string;
  description?: string;
}

export const pledgeService = {
  create: (data: CreatePledgeInput) =>
    api<{ pledge: Pledge }>("/pledges", {
      method: "POST",
      body: data,
    }),

  getMine: () =>
    api<{ items: Pledge[] }>("/pledges/mine"),

  getById: (id: number) =>
    api<{ pledge: Pledge }>(`/pledges/${id}`),

  cancel: (id: number) =>
    api<{ pledge: Pledge }>(
      `/pledges/${id}/cancel`,
      { method: "PATCH" }
    ),
};