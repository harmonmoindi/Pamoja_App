import { useCallback, useEffect, useState } from "react";
import { createCentre, fetchMyCentres, updateCentre } from "../services/centreService";
import type { ApiCollectionCentre, CentrePayload } from "../types/centre";

export default function useApiCentres() {
  const [centres, setCentres] = useState<ApiCollectionCentre[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchMyCentres(page);
      setCentres(result.items);
      setTotal(result.total);
      setPerPage(result.perPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collection centres.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addCentre = async (data: CentrePayload) => {
    const { centre } = await createCentre(data);

    if (page === 1) {
      setCentres(prev => [centre, ...prev].slice(0, perPage));
      setTotal(prev => prev + 1);
    } else {
      setPage(1);
    }

    return centre;
  };

  const editCentre = async (id: number, data: Partial<CentrePayload>) => {
    const { centre } = await updateCentre(id, data);
    setCentres(prev => prev.map(c => c.id === id ? centre : c));
    return centre;
  };

  return {
    centres, loading, error, reload,
    addCentre, editCentre,
    page, setPage, total, perPage
  };
}