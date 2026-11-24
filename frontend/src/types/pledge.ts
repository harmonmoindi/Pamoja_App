export type PledgeStatus =
  | "Pending"
  | "Confirmed"
  | "Fulfilled"
  | "Cancelled";

export interface Pledge {
  id: number;
  reference: string;
  opportunityId: number;
  opportunityTitle: string;
  amount: number;
  date: string;
  createdAt: string;
  dueDate?: string;
  status: PledgeStatus;
  donorId: number;
  paymentMethod: string;
}
