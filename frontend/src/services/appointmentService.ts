
import { api } from "../lib/apiClient";

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface AppointmentRecord {
  id: number;
  centreId: number;
  centreName: string;
  county: string;
  location: string;
  slotStart: string;
  status: AppointmentStatus;
  createdAt?: string;
}

export interface CreateAppointmentInput {
  centreId: number;
  slotStart: string;
}

export const appointmentService = {
  create: (data: CreateAppointmentInput) =>
    api<{ appointment: AppointmentRecord }>("/appointments", {
      method: "POST",
      body: data,
    }),

  getMine: () =>
    api<{ items: AppointmentRecord[] }>("/appointments/mine"),

  getById: (id: number) =>
    api<{ appointment: AppointmentRecord }>(`/appointments/${id}`),

  cancel: (id: number) =>
    api<{ message: string; appointment: AppointmentRecord }>(
      `/appointments/${id}/cancel`,
      { method: "PATCH" }
    ),
};
