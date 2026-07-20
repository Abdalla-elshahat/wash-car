import Cookies from "js-cookie";
import { Domain } from "../utels/const";

/**
 * Get orders by Laundry ID with optional filters (status, paymentMethod, page, limit)
 */
export async function getOrdersByLaundryId(laundryId, { status, paymentMethod, page = 1, limit = 10 } = {}) {
  const token = Cookies.get("token");
  
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (paymentMethod) queryParams.append("paymentMethod", paymentMethod);
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const response = await fetch(`${Domain}/orders/laundry/${laundryId}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch laundry orders");
  }

  return res;
}

/**
 * Create a new order with optional couponCode
 */
export async function createOrder(orderData) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to create order");
  }

  return res;
}

/**
 * Update order status (Owner / Admin)
 */
export async function updateOrderStatus(orderId, status) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/orders/status/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update order status");
  }

  return res;
}

/**
 * Validate coupon code
 */
export async function validateCoupon(code, laundryId) {
  const token = Cookies.get("token");
  const query = laundryId ? `?laundryId=${laundryId}` : "";

  const response = await fetch(`${Domain}/coupons/validate/${code}${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Invalid coupon code");
  }

  return res;
}

/**
 * Get client's orders (/orders/client)
 */
export async function getClientOrders({ page = 1, limit = 10 } = {}) {
  const token = Cookies.get("token");
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const response = await fetch(`${Domain}/orders/client?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch client orders");
  }

  return res;
}

/**
 * Cancel client order
 */
export async function cancelClientOrder(orderId) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to cancel order");
  }

  return res;
}
