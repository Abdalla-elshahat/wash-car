import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Store,
  ExternalLink,
  ShieldCheck,
  Check,
  FileText,
  Eye,
  Download,
  X,
  MessageSquare,
} from "lucide-react";
import { getInactiveLaundries, updateLaundryStatus } from "../apicalls/laundry";
import {
  getDocumentsByLaundry,
  approveDocument,
  rejectDocument,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  downloadDocumentFile,
  previewDocumentFile,
} from "../apicalls/documents";
import { Domain, formatTime12H } from "../utels/const";
import { toast } from "react-toastify";

const DOCUMENT_META = {
  TAX_CARD: "Tax Card",
  COMMERCIAL_REGISTRATION: "Commercial Registration",
  BUSINESS_LICENSE: "Business License",
  NATIONAL_ID_FRONT: "National ID (Front)",
  NATIONAL_ID_BACK: "National ID (Back)",
};

/* ─── Admin Document Review Modal ─── */
function AdminDocReviewModal({ laundry, onClose, onStatusChanged }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionDocId, setActionDocId] = useState(null);

  // Reject modal state
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!laundry?._id) return;
    try {
      setLoading(true);
      setError("");
      const docs = await getDocumentsByLaundry(laundry._id);
      setDocuments(docs);
    } catch (err) {
      setError(err.message || "Failed to load documents for this laundry");
    } finally {
      setLoading(false);
    }
  }, [laundry?._id]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleApprove = async (docId, docLabel) => {
    try {
      setActionDocId(docId);
      await approveDocument(docId);
      toast.success(`Approved ${docLabel}`);
      await fetchDocs();
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      toast.error(err.message || "Failed to approve document");
    } finally {
      setActionDocId(null);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectNotes.trim()) {
      toast.error("Rejection notes are required when rejecting a document.");
      return;
    }

    try {
      setSubmittingReject(true);
      await rejectDocument(rejectingDoc._id, rejectNotes.trim());
      toast.success(`Rejected document: ${DOCUMENT_META[rejectingDoc.documentType] || rejectingDoc.documentType}`);
      setRejectingDoc(null);
      setRejectNotes("");
      await fetchDocs();
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      toast.error(err.message || "Failed to reject document");
    } finally {
      setSubmittingReject(false);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Admin Verification: Documents Review</h3>
              <p className="text-xs text-slate-500">{laundry.name} &bull; Laundry ID: {laundry._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
              <p className="text-sm text-slate-500 font-medium">Fetching documents...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-center text-sm border border-rose-100 font-medium">
              {error}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No documents found for this application.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const label = DOCUMENT_META[doc.documentType] || doc.documentType;
                const isApproved = doc.status === "APPROVED";
                const isRejected = doc.status === "REJECTED";
                const isProcessing = actionDocId === doc._id;

                return (
                  <div
                    key={doc._id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      isApproved
                        ? "bg-emerald-50/40 border-emerald-200"
                        : isRejected
                        ? "bg-rose-50/40 border-rose-200"
                        : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg flex-shrink-0 ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-600"
                            : isRejected
                            ? "bg-rose-100 text-rose-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isRejected
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{doc.fileName}</p>
                        {isRejected && doc.notes && (
                          <div className="mt-2 text-xs bg-rose-100/80 text-rose-900 p-2 rounded border border-rose-200">
                            <strong>Rejection Note:</strong> {doc.notes}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-indigo-600">
                          {doc.previewUrl && (
                            <a
                              href={getDocumentPreviewUrl(doc._id, doc.previewUrl)}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePreview(doc._id, doc.previewUrl);
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Eye size={13} /> Preview
                            </a>
                          )}
                          <a
                            href={getDocumentDownloadUrl(doc._id)}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownload(doc._id, doc.fileName);
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons per document */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleApprove(doc._id, label)}
                        disabled={isApproved || isProcessing}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-700 cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                        <span>{isApproved ? "Approved" : "Approve"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingDoc(doc);
                          setRejectNotes(doc.notes || "");
                        }}
                        disabled={isRejected || isProcessing}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isRejected
                            ? "bg-rose-100 text-rose-700 cursor-default"
                            : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
                        }`}
                      >
                        <XCircle size={13} />
                        <span>{isRejected ? "Rejected" : "Reject"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Reject Reason Dialog Modal */}
      {rejectingDoc && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <MessageSquare size={22} />
              <h4 className="font-bold text-slate-900 text-base">Reject Document</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Enter mandatory rejection notes for <strong>{DOCUMENT_META[rejectingDoc.documentType] || rejectingDoc.documentType}</strong>. The owner will see these notes to re-upload.
            </p>

            <form onSubmit={handleConfirmReject}>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Reason for rejection (e.g., Unclear image, expired license, wrong document type)..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none mb-4 min-h-[90px]"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectNotes.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {submittingReject ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Rejecting...
                    </>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Admin Inactive Laundries Page ─── */
export default function AdminInactiveLaundries() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [selectedReviewLaundry, setSelectedReviewLaundry] = useState(null);

  const fetchInactive = async () => {
    try {
      setLoading(true);
      const data = await getInactiveLaundries();
      setLaundries(data);
    } catch (err) {
      setError(err.message || "Failed to load inactive laundries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactive();
  }, []);

  const handleActivate = async (id, name) => {
    try {
      setActionId(id);
      await updateLaundryStatus(id, "approved");
      toast.success(`"${name}" is now Active!`);
      fetchInactive();
    } catch (err) {
      toast.error(err.message || "Failed to activate laundry.");
    } finally {
      setActionId(null);
    }
  };

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `${Domain}/uploads/laundries/${logo}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <ShieldCheck className="text-red-500" size={32} />
              <span>Admin Panel: Inactive Laundries & Verification</span>
            </h1>
            <p className="text-gray-500 mt-1.5">
              Review documents, approve/reject legal verification records, and activate wash centers.
            </p>
          </div>
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 font-semibold text-sm flex items-center gap-2">
            <Store size={16} />
            <span>{laundries.length} Inactive Center{laundries.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Loader or Error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={44} className="text-red-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Fetching inactive list...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center max-w-md mx-auto my-12">
            <p className="font-semibold mb-2">Error Occurred</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : laundries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm">
            <CheckCircle className="mx-auto text-emerald-400 mb-4" size={56} />
            <h3 className="text-lg font-bold text-gray-800">All Laundries Active</h3>
            <p className="text-gray-500 text-sm mt-1">Excellent! No inactive or pending car washes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {laundries.map((laundry) => {
              const logoUrl = getLogoUrl(laundry.logo);
              return (
                <div
                  key={laundry._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col group"
                >
                  {/* Header */}
                  <div className="p-6 pb-0 flex items-start gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-150 flex items-center justify-center border border-gray-250 flex-shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt={laundry.name} className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <Store className="text-gray-400" size={22} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 truncate max-w-[160px]">{laundry.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={s <= Math.round(laundry.rating || 0) ? "fill-amber-400" : "text-gray-200"}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">({laundry.totalReviews || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {laundry.status || "pending"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {laundry.description || "No description provided."}
                    </p>

                    <div className="space-y-2 mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{laundry.address || "No address"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                        <span>{laundry.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                        <span>
                          {formatTime12H(laundry.workingHours?.from || "09:00")} - {formatTime12H(laundry.workingHours?.to || "22:00")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Review Action */}
                  <div className="px-6 py-3 bg-indigo-50/50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-600" /> Documents Verification
                    </span>
                    <button
                      onClick={() => setSelectedReviewLaundry(laundry)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg transition"
                    >
                      Review Docs
                    </button>
                  </div>

                  {/* Bottom Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                    <Link
                      to={`/laundries/${laundry._id}`}
                      className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-800 transition duration-150"
                    >
                      <span>Preview Details</span>
                      <ExternalLink size={12} />
                    </Link>

                    <button
                      onClick={() => handleActivate(laundry._id, laundry.name)}
                      disabled={actionId === laundry._id}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm hover:shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionId === laundry._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Activate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Document Review Modal */}
      {selectedReviewLaundry && (
        <AdminDocReviewModal
          laundry={selectedReviewLaundry}
          onClose={() => setSelectedReviewLaundry(null)}
          onStatusChanged={fetchInactive}
        />
      )}
    </div>
  );
}
