import Cookies from "js-cookie";
import { Domain } from "../utels/const";

/**
 * Get all coupons for a laundry
 */
export async function getLaundryCoupons(laundryId) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/coupons/laundry/${laundryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch coupons for this laundry");
  }

  return Array.isArray(res) ? res : res.data ?? [];
}

/**
 * Create a new coupon (Owner)
 */
export async function createCoupon(couponData) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(couponData),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to create coupon");
  }

  return res;
}

/**
 * Update an existing coupon (Owner)
 */
export async function updateCoupon(couponId, couponData) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/coupons/${couponId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(couponData),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update coupon");
  }

  return res;
}

/**
 * Delete a coupon (Owner)
 */
export async function deleteCoupon(couponId) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/coupons/${couponId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to delete coupon");
  }

  return res;
}

/**
 * Validate coupon by code
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
 * Use coupon code (Client)
 */
export async function useCoupon(code, { serviceId, laundryId }) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/coupons/use/${code}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ serviceId, laundryId }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to use coupon");
  }

  return res;
}
