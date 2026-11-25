
import { useCallback, useEffect, useMemo, useState } from "react";
import { centreService } from "../services/centreService";
import { initialCentres } from "../data/mock/centres";
import type {
  CollectionCentre,
  CentreInput,
} from "../types/centre";

export function useCentres() {
  const [centres, setCentres] =
    useState<CollectionCentre[]>(initialCentres);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await centreService.getAll();
      setCentres(response.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load collection centres."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCentres();
  }, [fetchCentres]);

  const addCentre = (centre: CentreInput) => {
    const newCentre: CollectionCentre = {
      ...centre,
      id: `CTR${Date.now()}`,
    };

    setCentres((current) => [...current, newCentre]);
  };

  const updateCentre = (
    id: string,
    updates: Partial<CollectionCentre>
  ) => {
    setCentres((current) =>
      current.map((centre) =>
        centre.id === id ? { ...centre, ...updates } : centre
      )
    );
  };

  const toggleCentre = (id: string) => {
    setCentres((current) =>
      current.map((centre) =>
        centre.id === id
          ? {
              ...centre,
              status:
                centre.status === "Active" ? "Inactive" : "Active",
            }
          : centre
      )
    );
  };

  const activeCount = useMemo(
    () => centres.filter((centre) => centre.status === "Active").length,
    [centres]
  );

  const nearCapacityCount = useMemo(
    () =>
      centres.filter(
        (centre) =>
          centre.capacity > 0 &&
          centre.currentLoad / centre.capacity >= 0.8
      ).length,
    [centres]
  );

  return {
    centres,
    loading,
    error,
    refresh: fetchCentres,
    addCentre,
    updateCentre,
    toggleCentre,
    activeCount,
    nearCapacityCount,
  };
}

export default useCentres;
