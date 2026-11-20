export type DonationStatus =
  | "Pending"
  | "Processing"
  | "Successful"
  | "Failed";

export interface Donation {
  id: number;
  reference: string;
  donorId: number;
  opportunityId?: number;
  opportunityTitle?: string;
  amount: number;
  paymentMethod: "M-Pesa" | "Card" | "Bank Transfer";
  transactionCode?: string;
  status: DonationStatus;
  date: string;
}

export interface PaymentStatus {
  status: DonationStatus;
  message: string;
  transactionCode?: string;
  amount: number;
  date: string;
}
