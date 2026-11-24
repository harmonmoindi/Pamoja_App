import { useMemo, useState } from "react";
import { mockOpportunities } from "../data/mock/opportunities";
import type {
  Opportunity,
  OpportunityFilters,
} from "../types/opportunity";

const initialFilters: OpportunityFilters = {
  category: "All",
  county: "All",
  urgency: "All",
  search: "",
  status: "All",
};

export function useOpportunities() {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities);

  const [filters, setFilters] =
    useState<OpportunityFilters>(initialFilters);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesCategory =
        filters.category === "All" ||
        opportunity.category === filters.category;

      const matchesCounty =
        filters.county === "All" ||
        opportunity.county === filters.county;

      const matchesUrgency =
        filters.urgency === "All" ||
        opportunity.urgency === filters.urgency;

      const matchesStatus =
        filters.status === "All" ||
        opportunity.status === filters.status;

      const searchTerm = filters.search.toLowerCase();

      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchTerm) ||
        opportunity.description.toLowerCase().includes(searchTerm) ||
        opportunity.location.toLowerCase().includes(searchTerm) ||
        opportunity.organization.toLowerCase().includes(searchTerm);

      return (
        matchesCategory &&
        matchesCounty &&
        matchesUrgency &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [opportunities, filters]);

  const updateFilters = (newFilters: Partial<OpportunityFilters>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const getOpportunityById = (id: number) => {
    return opportunities.find((opportunity) => opportunity.id === id);
  };

  return {
    opportunities,
    filteredOpportunities,
    filters,
    updateFilters,
    resetFilters,
    getOpportunityById,
  };
}
