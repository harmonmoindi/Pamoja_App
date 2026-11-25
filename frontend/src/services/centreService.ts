
import { api } from "../lib/apiClient";
import type { CollectionCentre } from "../types/centre";

export const centreService = {
  getAll: () =>
    api<{ items: CollectionCentre[] }>("/centres"),

  getById: (id: number) =>
    api<{ centre: CollectionCentre }>(`/centres/${id}`),
};
