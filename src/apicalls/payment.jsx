import Cookies from "js-cookie";
import { Domain } from "../utels/const";

/**
 * Create or retrieve Payment Intent for an Order
 */
export async function createPaymentIntent(orderId, amount) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/payments/create-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, amount }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to create payment intent");
  }
  return res;
}

/**
 * Confirm payment status (Mark order as paid)
 */
export async function confirmPayment({ paymentIntentId, orderId, paymentId }) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/payments/confirm-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ paymentIntentId, orderId, paymentId }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to confirm payment");
  }
  return res;
}

/**
 * Get payment details by Order ID
 */
export async function getPaymentByOrderId(orderId) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/payments/order/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch payment details");
  }
  return res;
}

/**
 * Get current user's payment history
 */
export async function getMyPayments() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/payments/my-payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch payment history");
  }
  return res;
}

/**
 * Charge Card & Create Order in single atomic step
 */
export async function payAndCreateOrder(payload) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/payments/pay-and-create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Payment card processing failed.");
  }
  return res;
}
