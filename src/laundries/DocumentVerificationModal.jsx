import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Eye,
  Download,
  Loader2,
  X,
  ShieldAlert,
  Info,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDocumentsByLaundry,
  reuploadDocument,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  downloadDocumentFile,
  previewDocumentFile,
} from "../apicalls/documents";

const DOCUMENT_META = {
  TAX_CARD: { label: "Tax Card", desc: "Official Tax Card document" },
  COMMERCIAL_REGISTRATION: { label: "Commercial Registration", desc: "Commercial register entry document" },
  BUSINESS_LICENSE: { label: "Business License", desc: "Valid operational business license" },
  NATIONAL_ID_FRONT: { label: "National ID (Front)", desc: "Front side of National Identity Card" },
  NATIONAL_ID_BACK: { label: "National ID (Back)", desc: "Back side of National Identity Card" },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export default function DocumentVerificationModal({ laundry, onClose, onUpdated }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewModal, setPreviewModal] = useState(null);

  const handleOpenPopupPreview = (doc, localFile) => {
    let url = "";
    let isImage = false;
    let isPdf = false;
    let name = doc?.fileName || "Document";

    if (localFile) {
      url = URL.createObjectURL(localFile);
      isImage = localFile.type.startsWith("image/");
      isPdf = localFile.type === "application/pdf";
      name = localFile.name;
    } else if (doc) {
      url = getDocumentPreviewUrl(doc._id, doc.previewUrl);
      const ext = (doc.fileName || doc.mimeType || doc.previewUrl || "").toLowerCase();
      isImage = ext.includes("jpg") || ext.includes("jpeg") || ext.includes("png") || ext.includes("image");
      isPdf = ext.includes("pdf");
    }

    const meta = DOCUMENT_META[doc?.documentType] || { label: doc?.documentType || "Verification Document" };
    setPreviewModal({ title: meta.label, url, isImage, isPdf, name });
  };

  const fetchDocs = useCallback(async () => {
    if (!laundry?._id) return;
    try {
      setLoading(true);
      setError("");
      const docs = await getDocumentsByLaundry(laundry._id);
      setDocuments(docs);
    } catch (err) {
      setError(err.message || "Failed to load laundry verification documents");
    } finally {
      setLoading(false);
    }
  }, [laundry?._id]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileSelect = (docId, file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleReupload = async (docId) => {
    const file = selectedFiles[docId];
    if (!file) {
      toast.error("Please select a file to upload first");
      return;
    }

    try {
      setUploadingDocId(docId);
      await reuploadDocument(docId, file);
      toast.success("Document re-uploaded successfully! Status reset to PENDING for review.");
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      await fetchDocs();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || "Failed to re-upload document");
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      await downloadDocumentFile(docId, fileName);
    } catch (err) {
      toast.error(err.message || "Failed to download document");
    }
  };

  const handlePreview = (docId, previewUrl) => {
    previewDocumentFile(docId, previewUrl);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="modal-title">Document Verification Status</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {laundry?.name} &bull; Manage legal verification documents
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={36} className="spin text-indigo-600 mb-3" />
              <p className="text-sm text-gray-500">Loading document verification records...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-center text-sm">
              <p className="font-semibold">{error}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Info className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 font-medium">No document records found for this laundry.</p>
            </div>
          ) : (
            <>
              {/* Info banner if any rejected */}
              {documents.some((d) => d.status === "REJECTED") && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3">
                  <ShieldAlert className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="font-semibold block mb-0.5">Action Required: Rejected Documents</strong>
                    <span>
                      One or more of your documents were rejected during review. Please review the admin feedback notes below and re-upload corrected files for review.
                    </span>
                  </div>
                </div>
              )}

              {/* Document List */}
              <div className="space-y-4">
                {documents.map((doc) => {
                  const meta = DOCUMENT_META[doc.documentType] || { label: doc.documentType, desc: "" };
                  const isRejected = doc.status === "REJECTED";
                  const isApproved = doc.status === "APPROVED";
                  const isPending = doc.status === "PENDING";
                  const selectedFile = selectedFiles[doc._id];
                  const isUploading = uploadingDocId === doc._id;

                  return (
                    <div
                      key={doc._id}
                      className={`p-4 rounded-xl border transition-all ${isRejected
                        ? "bg-rose-50/40 border-rose-200"
                        : isApproved
                          ? "bg-emerald-50/30 border-emerald-200"
                          : "bg-amber-50/20 border-amber-200"
                        }`}
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-lg flex-shrink-0 ${isRejected
                              ? "bg-rose-100 text-rose-600"
                              : isApproved
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-amber-100 text-amber-600"
                              }`}
                          >
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{meta.label}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.fileName || meta.desc}</p>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              Size: {(doc.size / 1024).toFixed(1)} KB &bull; Type: {doc.mimeType?.split("/")[1]?.toUpperCase() || "File"}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle size={14} />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertCircle size={14} />
                              Pending Review
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle size={14} />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions row: View Popup, Edit File & Download */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          {/* View Popup Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPopupPreview(doc, selectedFile)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <Eye size={14} /> View
                          </button>

                          {/* Edit / Change File Button */}
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold transition shadow-sm">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              hidden
                              onChange={(e) => handleFileSelect(doc._id, e.target.files[0])}
                            />
                            <Pencil size={14} /> Edit
                          </label>

                          {/* Download Button */}
                          <a
                            href={getDocumentDownloadUrl(doc._id)}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownload(doc._id, doc.fileName);
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>

                        {/* Submit Re-upload Button if file selected */}
                        {selectedFile && (
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => handleReupload(doc._id)}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-sm"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 size={14} className="spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                Confirm Upload ({selectedFile.name.substring(0, 15)}...)
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Rejection Notes Box */}
                      {isRejected && (
                        <div className="mt-3 p-3 rounded-lg bg-rose-100/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
                          <strong className="block font-bold mb-1 flex items-center gap-1">
                            <ShieldAlert size={14} className="text-rose-600 dark:text-rose-400" /> Rejection Feedback from Admin:
                          </strong>
                          <p className="leading-relaxed bg-white/60 dark:bg-slate-800/80 p-2 rounded border border-rose-200 dark:border-rose-800 font-mono text-[12px]">
                            {doc.notes || "No notes provided."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Image / Document Preview Popup Modal */}
      {previewModal && (
        <div
          style={{ zIndex: 100000 }}
          className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90">
              <div className="flex items-center gap-2">
                <Eye className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{previewModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 min-h-[320px]">
              {previewModal.isImage ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                />
              ) : previewModal.isPdf ? (
                <iframe
                  src={previewModal.url}
                  title={previewModal.title}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{previewModal.name}</p>
                  <a
                    href={previewModal.url}
                    download={previewModal.name}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-2"
                  >
                    <Download size={14} /> Open / Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
