import { api, Page } from "@/lib/apiClient";

/** Matches InventoryItemSchema. Agency inventory routes fill this in. */
export interface InventoryItem {
  id: number;
  reference: string | null;
  organizationId: number;
  name: string;
  category: string;
  county: string;
  quantity: number;
  unit: string;
  minimum: number;
  createdAt: string;
  updatedAt: string;
}

export const listInventory = () => api<Page<InventoryItem>>("/inventory");
