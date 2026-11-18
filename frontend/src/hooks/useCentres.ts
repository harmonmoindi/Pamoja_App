import { useState } from "react";
import { initialCentres } from "../data/mock/centres";
import type { CollectionCentre, CentreInput } from "../types/centre";

export default function useCentres() {
  const [centres, setCentres] = useState<CollectionCentre[]>(initialCentres);

  const addCentre = (data: CentreInput) =>
    setCentres(prev => [...prev, { ...data, id: crypto.randomUUID() }]);

  const updateCentre = (id: string, data: CentreInput) =>
    setCentres(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

  const toggleCentre = (id: string) =>
    setCentres(prev => prev.map((c): CollectionCentre =>
      c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
    ));

  const activeCount = centres.filter(c => c.status === "Active").length;
  const nearCapacityCount = centres.filter(c =>
    c.status === "Active" && c.capacity > 0 && c.currentLoad / c.capacity >= 0.8
  ).length;

  return { centres, addCentre, updateCentre, toggleCentre, activeCount, nearCapacityCount };
}