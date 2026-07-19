import { Domain } from "../utels/const";

// Get logged-in user profile data
export async function getProfile() {
  const response = await fetch(`${Domain}/users/me`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user profile");
  }
  return response.json();
}

// Update user profile details & image
export async function updateProfile(formData) {
  const response = await fetch(`${Domain}/users`, {
    method: "PATCH",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user profile");
  }
  return response.json();
}

// Delete user account
export async function deleteAccount() {
  const response = await fetch(`${Domain}/users`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete account");
  }
  return response.json();
}
