
import { useCallback, useEffect, useState } from "react";
import { opportunityService } from "../services/opportunityService";
import type {
  Opportunity,
  OpportunityFilters,
} from "../types/opportunity";

const initialFilters: OpportunityFilters = {
  category: "",
  county: "",
  urgency: "",
  search: "",
  status: "",
};

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filters, setFilters] =
    useState<OpportunityFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await opportunityService.getAll(filters);

      setOpportunities(response.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const updateFilters = (newFilters: Partial<OpportunityFilters>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    opportunities,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refresh: fetchOpportunities,
  };
}
