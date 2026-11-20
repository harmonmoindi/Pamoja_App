export type OpportunityStatus =
  | "Need identified"
  | "Assessed"
  | "Published"
  | "Pledged"
  | "Allocated"
  | "Delivered"
  | "Confirmed";

export type OpportunityCategory =
  | "Food"
  | "Water"
  | "Shelter"
  | "Medical"
  | "Education"
  | "Clothing"
  | "Other";

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  category: OpportunityCategory;
  location: string;
  county: string;
  targetAmount: number;
  raisedAmount: number;
  beneficiaries: number;
  urgency: "Low" | "Medium" | "High" | "Critical";
  status: OpportunityStatus;
  image?: string;
  organization: string;
  createdAt: string;
  deadline?: string;
}

export interface OpportunityFilters {
  category: string;
  county: string;
  urgency: string;
  search: string;
  status: string;
}
