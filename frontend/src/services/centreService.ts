import { api, type Page } from "../lib/apiClient";
import type { ApiCollectionCentre, CentrePayload } from "../types/centre";
import type { CollectionCentre } from "../types/centre";

export function fetchCentres(page = 1) {
  return api<Page<ApiCollectionCentre>>("/centres", {
    auth: false,
    params: { page }
  });
}

export function fetchMyCentres(page = 1) {
  return api<Page<ApiCollectionCentre>>("/centres/mine", {
    params: { page }
  });
}

export function createCentre(data: CentrePayload) {
  return api<{ centre: ApiCollectionCentre }>("/centres", {
    method: "POST",
    body: data
  });
}

export function updateCentre(id: number, data: Partial<CentrePayload>) {
  return api<{ centre: ApiCollectionCentre }>(`/centres/${id}`, {
    method: "PATCH",
    body: data
  });
}

export const centreService = {
  getAll: () =>
    api<{ items: CollectionCentre[] }>("/centres"),

  getById: (id: number) =>
    api<{ centre: CollectionCentre }>(`/centres/${id}`)
};