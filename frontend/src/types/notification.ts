export type NotificationType =
  | "Donation"
  | "Pledge"
  | "Opportunity"
  | "Payment"
  | "System";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  link?: string;
}
