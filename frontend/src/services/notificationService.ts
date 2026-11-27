import { api, type Page } from "@/lib/apiClient";

export type ApiNotification = {
  id: number;
  title: string;
  body: string;
  kind: string;
  isRead: boolean;
  createdAt: string;
};

export const notificationService = {
  getAll: (page = 1, perPage = 50) =>
    api<Page<ApiNotification>>("/notifications", {
      params: { page, perPage },
    }),

  markAsRead: (id: number) =>
    api<{ notification: ApiNotification }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    api<{ updated: number }>("/notifications/read-all", {
      method: "PATCH",
    }),
};
