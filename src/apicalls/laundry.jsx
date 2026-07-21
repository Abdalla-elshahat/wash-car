import Cookies from "js-cookie";
import { Domain } from "../utels/const";

export async function getOwnerLaundries() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/laundries/owner`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch laundries");
  }

  const res = await response.json();
  return Array.isArray(res) ? res : res.data ?? [];
}

export async function createLaundry(formData) {
  const token = Cookies.get("token");

  // Build multipart/form-data (backend uses FileInterceptor + @Body spread)
  const fd = new FormData();
  fd.append("name", formData.name);
  fd.append("description", formData.description ?? "");
  fd.append("phone", formData.phone);
  fd.append("address", formData.address);
  // Send nested objects as JSON strings so @Body can receive them
  fd.append("location", JSON.stringify(formData.location));
  fd.append("workingHours", JSON.stringify(formData.workingHours));
  if (formData.logo instanceof File) {
    fd.append("logo", formData.logo);
  }

  const response = await fetch(`${Domain}/laundries`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // NO Content-Type — browser sets multipart boundary
    body: fd,
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to create laundry");
  }

  return Array.isArray(res) ? res[0] : res.data ?? res;
}

export async function getLaundryById(id) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/laundries/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch laundry details");
  }

  // Support { data: {...} } or plain object
  return res.data ?? res;
}

export async function updateLaundry(id, formData) {
  const token = Cookies.get("token");

  const fd = new FormData();
  fd.append("name", formData.name);
  fd.append("description", formData.description ?? "");
  fd.append("phone", formData.phone);
  fd.append("address", formData.address);
  fd.append("location", JSON.stringify(formData.location));
  fd.append("workingHours", JSON.stringify(formData.workingHours));
  if (formData.logo instanceof File) {
    fd.append("logo", formData.logo);
  }

  const response = await fetch(`${Domain}/laundries/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update laundry");
  }

  return res.data ?? res;
}

export async function deleteLaundry(id) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/laundries/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to delete laundry");
  }
}

export async function getAllLaundries(page = 1, limit = 10, filters = {}) {
  const token = Cookies.get("token");
  const queryParams = new URLSearchParams({ page, limit });
  
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.append(key, val);
    }
  });

  const response = await fetch(`${Domain}/laundries?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch all laundries");
  }

  const res = await response.json();
  return res; // Return full response which contains data, total, totalPages, currentPage
}

export async function getInactiveLaundries() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/laundries/inactive/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch inactive laundries");
  }

  const res = await response.json();
  return Array.isArray(res) ? res : res.data ?? [];
}

export async function updateLaundryStatus(id, status) {
  const token = Cookies.get("token");

  const response = await fetch(`${Domain}/laundries/status/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update laundry status");
  }

  return res.data ?? res;
}

export async function getLaundryReviews(laundryId) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/reviews?laundryId=${laundryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch laundry reviews");
  }

  return await response.json();
}

export async function createLaundryReview(reviewData) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to submit review");
  }

  return res;
}

export async function updateLaundryReview(id, reviewData) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/reviews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to update review");
  }

  return res;
}

export async function deleteLaundryReview(id) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to delete review");
  }

  return true;
}