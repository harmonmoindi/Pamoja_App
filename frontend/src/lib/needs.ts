import { mockOpportunities } from "@/data/mock/opportunities";
import { api } from "./apiClient";

/**
 * One shape for the public pages (Explore, Opportunity detail, Needs map).
 * The live API is tried first. If it is not available or returns nothing, sample data is shown instead,
 * so these pages never show an empty screen during a demonstration.
 */
export type Need = {
  id: string;
  title: string;
  category: string;
  county: string;
  agency: string;
  description: string;
  urgency: string;
  stage: string;
  unit: string;
  requested: number;
  pledged: number;
  delivered: number;
  financialTarget: number;
  financialPledged: number;
  financialReceived: number;
  image: string;
  createdAt: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1637148734636-906c24feeb55?auto=format&fit=crop&w=1200&q=82";

type Raw = Record<string, unknown>;

function first(raw: Raw, keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function str(raw: Raw, keys: string[], fallback = ""): string {
  const value = first(raw, keys);
  return value === undefined ? fallback : String(value);
}

function num(raw: Raw, keys: string[]): number {
  const value = Number(first(raw, keys));
  return Number.isFinite(value) ? value : 0;
}

/** Accepts either the API's shape or the older sample-data shape (field names differ slightly). */
export function normalizeNeed(input: unknown): Need {
  const raw = (input ?? {}) as Raw;
  return {
    id: str(raw, ["id"], "0"),
    title: str(raw, ["title", "name"], "Untitled need"),
    category: str(raw, ["category"], "Community Support"),
    county: str(raw, ["county", "location"], "Kenya"),
    agency: str(raw, ["agency", "agencyName", "organizationName", "organization"], "Verified partner"),
    description: str(raw, ["description", "summary"], "Support is needed for this community."),
    urgency: str(raw, ["urgency", "priority"], "High priority"),
    stage: str(raw, ["stage", "status"], "Published"),
    unit: str(raw, ["unit", "resource"], "units"),
    requested: num(raw, ["requested", "targetQty", "targetQuantity", "target", "quantity"]),
    pledged: num(raw, ["pledged", "pledgedQty", "pledgedQuantity"]),
    delivered: num(raw, ["delivered", "deliveredQty", "allocated"]),
    financialTarget: num(raw, ["financialTarget", "targetAmount"]),
    financialPledged: num(raw, ["financialPledged"]),
    financialReceived: num(raw, ["financialReceived"]),
    image: str(raw, ["image", "imageUrl"], FALLBACK_IMAGE),
    createdAt: str(raw, ["createdAt"]),
  };
}

export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;
}

export async function loadNeeds(): Promise<{ items: Need[]; sample: boolean }> {
  try {
    const data = await api<unknown>("/opportunities", { auth: false, params: { perPage: 100 } });
    const list = Array.isArray(data) ? data : ((data as { items?: unknown[] })?.items ?? []);
    const items = list.map(normalizeNeed);
    if (items.length > 0) return { items, sample: false };
  } catch {
    /* the API is not available: use sample data below */
  }
  return { items: (mockOpportunities as unknown[]).map(normalizeNeed), sample: true };
}

export async function loadNeed(id: string): Promise<{ item: Need | null; sample: boolean }> {
  try {
    const data = await api<Raw>(`/opportunities/${id}`, { auth: false });
    const raw = (data.opportunity ?? data.item ?? data) as Raw;
    if (raw && raw.id !== undefined) return { item: normalizeNeed(raw), sample: false };
  } catch {
    /* fall back to the list or sample data */
  }
  const all = await loadNeeds();
  return { item: all.items.find((n) => n.id === id) ?? null, sample: all.sample };
}
