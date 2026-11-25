
import { api } from "../lib/apiClient";
import type { Donation, PaymentStatus } from "../types/donation";

export interface CreateDonationInput {
  amount: number;
  phone: string;
  opportunityId?: number;
}

export const donationService = {
  create: (data: CreateDonationInput) =>
    api<{ donation: Donation; message?: string }>("/donations", {
      method: "POST",
      body: data,
    }),

  getMine: () =>
    api<{ items: Donation[] }>("/donations/mine"),

  getById: (id: number) =>
    api<{ donation: Donation }>(`/donations/${id}`),

  getStatus: (id: number) =>
    api<PaymentStatus>(`/donations/${id}/status`),
};
