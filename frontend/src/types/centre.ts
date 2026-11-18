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
