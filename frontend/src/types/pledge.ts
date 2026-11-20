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
  status: PledgeStatus;
  donorId: number;
  paymentMethod: string;
}
