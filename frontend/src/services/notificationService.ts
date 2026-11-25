
import type { Notification } from "../types/notification";

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return [];
  },

  markAsRead: async (_id: number): Promise<void> => {
    throw new Error("Notification API is not available yet.");
  },

  markAllAsRead: async (): Promise<void> => {
    throw new Error("Notification API is not available yet.");
  },
};
