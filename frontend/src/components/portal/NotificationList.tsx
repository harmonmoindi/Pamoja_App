import { useState } from "react";
import type { Notification } from "../../types/notification";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
}

export default function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationListProps) {
  const [localNotifications, setLocalNotifications] =
    useState<Notification[]>(notifications);

  const unreadCount = localNotifications.filter(
    (notification) => !notification.read
  ).length;

  const getCreatedAt = (notification: Notification) =>
    (
      notification as Notification & {
        createdAt?: string | number | Date;
      }
    ).createdAt;

  const typeStyles: Record<string, string> = {
    donation: "bg-green-100 text-green-700",
    pledge: "bg-yellow-100 text-yellow-700",
    opportunity: "bg-blue-100 text-blue-700",
    system: "bg-gray-100 text-gray-700",
    appointment: "bg-purple-100 text-purple-700",
  };

  const handleMarkAsRead = (id: number) => {
    setLocalNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    onMarkAllAsRead?.();
  };

  if (localNotifications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          You have no notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {unreadCount} unread notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {localNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-4 p-5 transition ${
              notification.read ? "bg-white" : "bg-orange-50"
            }`}
          >
            <div
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                notification.read
                  ? "bg-gray-300"
                  : "bg-orange-500"
              }`}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-gray-900">
                  {notification.title}
                </h4>

                <span
                  className={`rounded-full px-2 py-1 text-xs capitalize ${
                    typeStyles[notification.type.toLowerCase()] ??
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {notification.type}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>

              {getCreatedAt(notification) && (
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(
                    getCreatedAt(notification)!
                  ).toLocaleString("en-KE")}
                </p>
              )}
            </div>

            {!notification.read && (
              <button
                type="button"
                onClick={() =>
                  handleMarkAsRead(notification.id)
                }
                className="shrink-0 text-xs font-medium text-orange-600 hover:text-orange-700"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
