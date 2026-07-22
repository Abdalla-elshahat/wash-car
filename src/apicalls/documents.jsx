import Cookies from "js-cookie";
import { Domain } from "../utels/const";

/**
 * Get all documents belonging to the logged-in laundry owner
 */
export async function getMyDocuments() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/my-documents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to fetch documents");
  }

  const res = await response.json();
  return Array.isArray(res) ? res : res.data ?? [];
}

/**
 * Get documents for a specific laundry by laundry ID
 */
export async function getDocumentsByLaundry(laundryId) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/laundry/${laundryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to fetch laundry documents");
  }

  const res = await response.json();
  return Array.isArray(res) ? res : res.data ?? [];
}

/**
 * Re-upload a rejected document
 * @param {string} documentId 
 * @param {File} file 
 */
export async function reuploadDocument(documentId, file) {
  const token = Cookies.get("token");
  const fd = new FormData();
  fd.append("file", file);

  const response = await fetch(`${Domain}/documents/reupload/${documentId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to re-upload document");
  }

  return res.data ?? res;
}

/**
 * Admin: Get all pending laundry applications with their verification documents
 */
export async function getPendingApplicationsForAdmin() {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/admin/pending-applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to fetch pending applications");
  }

  const res = await response.json();
  return Array.isArray(res) ? res : res.data ?? [];
}

/**
 * Admin: Approve a document individually
 */
export async function approveDocument(documentId) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/admin/${documentId}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to approve document");
  }

  return res.data ?? res;
}

/**
 * Admin: Reject a document individually with mandatory rejection notes
 */
export async function rejectDocument(documentId, notes) {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/admin/${documentId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ notes }),
  });

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to reject document");
  }

  return res.data ?? res;
}

/**
 * Get document preview URL (stream inline with authorization token query if needed, or presigned URL)
 */
export function getDocumentPreviewUrl(documentId, previewUrl) {
  const token = Cookies.get("token");
  if (previewUrl) {
    if (previewUrl.startsWith("http://") || previewUrl.startsWith("https://") || previewUrl.startsWith("blob:")) {
      return previewUrl;
    }
    const separator = previewUrl.includes("?") ? "&" : "?";
    return `${previewUrl}${separator}token=${token}`;
  }
  return `${Domain}/documents/${documentId}/preview?token=${token}`;
}

/**
 * Get document download URL
 */
export function getDocumentDownloadUrl(documentId) {
  const token = Cookies.get("token");
  return `${Domain}/documents/${documentId}/download?token=${token}`;
}

/**
 * Download document using authenticated fetch and blob URL
 */
export async function downloadDocumentFile(documentId, defaultFileName = "document") {
  const token = Cookies.get("token");
  const response = await fetch(`${Domain}/documents/${documentId}/download?token=${token}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    throw new Error(res.message || "Failed to download document");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  let fileName = defaultFileName;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      fileName = filenameMatch[1].replace(/['"]/g, "");
    }
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Open document preview in new tab using authenticated fetch blob or URL
 */
export async function previewDocumentFile(documentId, previewUrl) {
  const token = Cookies.get("token");
  if (previewUrl && (previewUrl.startsWith("http://") || previewUrl.startsWith("https://") || previewUrl.startsWith("blob:"))) {
    window.open(previewUrl, "_blank");
    return;
  }
  const targetUrl = previewUrl || `${Domain}/documents/${documentId}/preview`;
  const urlWithToken = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}token=${token}`;

  try {
    const response = await fetch(urlWithToken, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!response.ok) {
      window.open(urlWithToken, "_blank");
      return;
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  } catch (err) {
    window.open(urlWithToken, "_blank");
  }
}

