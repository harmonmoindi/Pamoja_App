export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  donor: string;
  donationType: string;
  centre: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}