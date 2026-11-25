
import { api } from "../lib/apiClient";
import type { Opportunity, OpportunityFilters } from "../types/opportunity";

interface OpportunityPage {
  items: Opportunity[];
  page: number;
  perPage: number;
  total: number;
}

export const opportunityService = {
  getAll: (filters?: Partial<OpportunityFilters>) => {
    const params = new URLSearchParams();

    if (filters?.category) params.set("category", filters.category);
    if (filters?.county) params.set("county", filters.county);
    if (filters?.urgency) params.set("urgency", filters.urgency);
    if (filters?.search) params.set("search", filters.search);

    const query = params.toString();

    return api<OpportunityPage>(
      `/opportunities${query ? `?${query}` : ""}`
    );
  },

  getById: (id: number) =>
    api<{ opportunity: Opportunity }>(`/opportunities/${id}`),
};
