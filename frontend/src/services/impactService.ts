import { api } from "@/lib/apiClient";

export interface ImpactSummary {
  metrics: { label: string; value: string; note: string }[];
  countyRequests: { county: string; count: number }[];
  /** value is the bar width (0 to 100); units is the real number of delivered units */
  categoryOutput: { name: string; units: number; value: number }[];
  commitmentProgress: { coordinated: number; received: number; allocated: number; pledgedOnly: number };
  awaitingDeliveryUnits: number;
}

/** Public: no sign-in needed. */
export function getImpactSummary() {
  return api<ImpactSummary>("/impact/summary", { auth: false });
}