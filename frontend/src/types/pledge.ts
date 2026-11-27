export type PledgeStatus =
  | "Pending"
  | "Confirmed"
  | "Fulfilled"
  | "Cancelled";

export type PledgeType = "financial" | "in_kind";

export interface Pledge {
  id: number;
  reference: string;
  opportunityId: number;
  opportunityTitle: string;
  pledgeType?: PledgeType;
  amount: number;
  quantity?: number | null;
  description?: string | null;
  date: string;
  createdAt: string;
  dueDate?: string;
  status: PledgeStatus;
  donorId: number;
  paymentMethod: string | null;
}