export type CentreStatus = "Active" | "Inactive";

export interface CollectionCentre {
  id: string;
  name: string;
  county: string;
  address: string;
  contact: string;
  capacity: number;
  currentLoad: number;
  status: CentreStatus;
}

export type CentreInput = Omit<CollectionCentre, "id">;
export interface ApiCollectionCentre {
  id: number;
  organizationId: number;
  name: string;
  county: string;
  generalArea: string;
  openingHours: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export type CentrePayload = Pick<
  ApiCollectionCentre,
  "name" | "county" | "generalArea" | "openingHours" | "categories"
>;