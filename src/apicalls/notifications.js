import Cookies from "js-cookie";
import { Domain } from "../utels/const";

/**
 * Fetch notifications with pagination and type filtering
 */
export async function getMyNotifications({ page = 1, limit = 10, type = "all" } = {}) {
  const token = Cookies.get("token");
  if (!token) return { data: [], total: 0, page: 1, totalPages: 1, unreadCount: 0 };

  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (type) queryParams.append("type", type);

  const response = await fetch(`${Domain}/notifications?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch notifications");
  }

  // Handle both array response and paginated object response
  if (Array.isArray(res)) {
    return { data: res, total: res.length, page: 1, totalPages: 1, unreadCount: res.filter(n => !n.isRead).length };
  }

  return res;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id) {
  const token = Cookies.get("token");
  if (!token) return;

  const response = await fetch(`${Domain}/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to mark notification as read");
  }

  return res;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const token = Cookies.get("token");
  if (!token) return;

  const response = await fetch(`${Domain}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to mark all notifications as read");
  }

  return res;
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences() {
  const token = Cookies.get("token");
  if (!token) return { orders: true, payments: true, laundries: true, system: true };

  const response = await fetch(`${Domain}/notifications/preferences`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch notification preferences");
  }

  return res;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(preferences) {
  const token = Cookies.get("token");
  if (!token) return;

  const response = await fetch(`${Domain}/notifications/preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update notification preferences");
  }

  return res;
}
