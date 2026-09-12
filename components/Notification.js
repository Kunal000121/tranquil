"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   fetchNotifications();
  //   // Poll for new notifications every 30 seconds
  //   const interval = setInterval(fetchNotifications, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  const fetchNotifications = async () => {
    try {
      // const response = await fetch("/api/user");
      // if (response.ok) {
      //   const data = await response.json();
      //   setUser(data.user);
      //   setNotifications(data.user.notifications.filter((n) => !n.read));
      // }
      console.error("Error fetching user:", error);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const dismissNotification = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  if (!user || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={index}
          className="bg-zinc-900 text-white p-4 rounded-lg shadow-lg border border-zinc-700 min-w-80 max-w-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-sm">{notification.fromName}</p>
                <p className="text-zinc-300 text-sm">{notification.message}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(index)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
