import { useState } from "react";
import NotificationList from "../../components/portal/NotificationList";
import type { Notification } from "../../types/notification";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay updated on your donations, pledges, and opportunities.
        </p>
      </div>

      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
