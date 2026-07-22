import Cookies from "js-cookie";
import { Domain } from "../utels/const";

export async function getAdminDashboardStats() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/admin/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch admin stats");
  }

  return response.json();
}

export async function getAdminUsers(search = "", role = "all", page = 1, limit = 10) {
  const token = Cookies.get("token");
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const response = await fetch(`${Domain}/admin/users?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch users");
  }

  return response.json();
}

export async function toggleAdminUserStatus(userId, isActive) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user status");
  }

  return response.json();
}

export async function updateAdminUserRole(userId, role) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user role");
  }

  return response.json();
}

export async function getAdminOrders(status = "all", search = "", page = 1, limit = 10) {
  const token = Cookies.get("token");
  const params = new URLSearchParams({ page, limit });
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  const response = await fetch(`${Domain}/admin/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch orders");
  }

  return response.json();
}
