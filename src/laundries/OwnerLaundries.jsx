import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Store,
  Plus,
  X,
  FileText,
  FileCheck,
  Upload,
  Pencil,
  Eye,
  Download,
} from "lucide-react";
import Navbar from "../component/Navbar/Navbar";
import { getOwnerLaundries, createLaundry } from "../apicalls/laundry";
import { Domain, formatTime12H } from "../utels/const";
import MapPicker from "../component/MapPicker";
import DocumentVerificationModal from "./DocumentVerificationModal";
import "./OwnerLaundries.css";

/* ─── Status config ─── */
const statusConfig = {
  pending: { label: "Pending", icon: AlertCircle, className: "status-pending" },
  approved: { label: "Approved", icon: CheckCircle, className: "status-approved" },
  rejected: { label: "Rejected", icon: XCircle, className: "status-rejected" },
};

function getLaundryLogo(logo) {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return `${Domain}/uploads/laundries/${logo}`;
}

function parseLaundryFields(laundry) {
  if (!laundry) return laundry;
  const parsed = { ...laundry };
  if (typeof parsed.workingHours === "string") {
    try {
      parsed.workingHours = JSON.parse(parsed.workingHours);
    } catch (e) {
      console.error("Failed to parse workingHours:", e);
    }
  }
  if (typeof parsed.location === "string") {
    try {
      parsed.location = JSON.parse(parsed.location);
    } catch (e) {
      console.error("Failed to parse location:", e);
    }
  }
  return parsed;
}

/* ─── Default form state ─── */
const defaultForm = {
  name: "",
  description: "",
  phone: "",
  address: "",
  lat: "30.0444",
  lng: "31.2357",
  workingFrom: "09:00",
  workingTo: "22:00",
};

const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB

/* ─── Add Laundry Modal ─── */
function AddLaundryModal({ onClose, onCreated }) {
  const [form, setForm] = useState(defaultForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // 5 Required Documents
  const [taxCard, setTaxCard] = useState(null);
  const [commercialRegistration, setCommercialRegistration] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [nationalIdFront, setNationalIdFront] = useState(null);
  const [nationalIdBack, setNationalIdBack] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);

  const handlePreviewLocalFile = (file, title) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const url = URL.createObjectURL(file);
    setPreviewModal({ title, url, isImage, isPdf, name: file.name });
  };

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function validateAndSetDoc(file, setter) {
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError("Invalid file format. Documents must be PDF, JPG, JPEG, or PNG.");
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    setError("");
    setter(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!taxCard || !commercialRegistration || !businessLicense || !nationalIdFront || !nationalIdBack) {
      setError("All 5 required legal verification documents must be uploaded before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        phone: form.phone,
        address: form.address,
        location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
        workingHours: { from: form.workingFrom, to: form.workingTo },
        logo: logoFile,
        taxCard,
        commercialRegistration,
        businessLicense,
        nationalIdFront,
        nationalIdBack,
      };
      const created = await createLaundry(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create laundry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box max-w-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-row">
              <div className="modal-icon-wrap">
                <Store size={20} />
              </div>
              <h2 className="modal-title">Add New Laundry Application</h2>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Logo Upload */}
            <div className="form-group">
              <label className="form-label">Laundry Logo</label>
              <div className="logo-upload-row">
                {logoPreview ? (
                  <img src={logoPreview} alt="preview" className="logo-preview" />
                ) : (
                  <div className="logo-preview-placeholder"><Store size={22} /></div>
                )}
                <label className="logo-upload-btn">
                  <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                  {logoFile ? "Change Image" : "Choose Image"}
                </label>
                {logoFile && (
                  <span className="logo-filename">{logoFile.name}</span>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Laundry Name <span className="required">*</span></label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Clean Car Wash"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of your service…"
                rows={3}
              />
            </div>

            {/* Phone + Address */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone <span className="required">*</span></label>
                <input
                  className="form-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="01000000000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address <span className="required">*</span></label>
                <input
                  className="form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Cairo, Egypt"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
                  Location Coordinates
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    backgroundColor: "#e0e7ff",
                    border: "1px solid #c7d2fe",
                    borderRadius: "8px",
                    color: "#4338ca",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c7d2fe"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#e0e7ff"}
                >
                  <MapPin size={12} />
                  اختر من الخريطة
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    className="form-input"
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    placeholder="Latitude e.g. 30.0444"
                    type="number"
                    step="any"
                  />
                  <span className="form-hint">Latitude</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    name="lng"
                    value={form.lng}
                    onChange={handleChange}
                    placeholder="Longitude e.g. 31.2357"
                    type="number"
                    step="any"
                  />
                  <span className="form-hint">Longitude</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={13} style={{ display: "inline", marginRight: 4 }} />
                Working Hours
              </label>
              <div className="form-row">
                <div className="form-group">
                  <input
                    className="form-input"
                    type="time"
                    name="workingFrom"
                    value={form.workingFrom}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Opens at</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="time"
                    name="workingTo"
                    value={form.workingTo}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Closes at</span>
                </div>
              </div>
            </div>

            {/* ─── Verification Documents Section ─── */}
            <div className="doc-section-card">
              <div className="doc-section-header">
                <FileCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="doc-section-title">Required Verification Documents <span className="required">*</span></h3>
                  <p className="doc-section-subtitle">PDF, JPG, JPEG or PNG (Max 5MB each)</p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {[
                  { label: "Tax Card", file: taxCard, setter: setTaxCard },
                  { label: "Commercial Registration", file: commercialRegistration, setter: setCommercialRegistration },
                  { label: "Business License", file: businessLicense, setter: setBusinessLicense },
                  { label: "National ID (Front)", file: nationalIdFront, setter: setNationalIdFront },
                  { label: "National ID (Back)", file: nationalIdBack, setter: setNationalIdBack },
                ].map((docItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{docItem.label} <span className="required">*</span></span>
                        {docItem.file && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                            <CheckCircle size={13} /> Uploaded
                          </span>
                        )}
                      </div>
                      {docItem.file ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-1 font-mono">{docItem.file.name}</p>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Not uploaded yet</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      {docItem.file ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePreviewLocalFile(docItem.file, docItem.label)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <Eye size={14} /> View
                          </button>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold transition shadow-sm">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => validateAndSetDoc(e.target.files[0], docItem.setter)}
                              hidden
                            />
                            <Pencil size={14} /> Edit
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => validateAndSetDoc(e.target.files[0], docItem.setter)}
                            hidden
                          />
                          <Upload size={14} /> Upload
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            {/* Actions */}
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={16} className="spin" /> Submitting Application…</>
                ) : (
                  <><Plus size={16} /> Submit Laundry Application</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showMap && (
        <MapPicker
          initialLat={form.lat}
          initialLng={form.lng}
          onSelect={(lat, lng) => {
            setForm((prev) => ({ ...prev, lat, lng }));
          }}
          onClose={() => setShowMap(false)}
        />
      )}

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
    </>
  );
}

/* ─── Laundry Card ─── */
function LaundryCard({ laundry, onOpenDocs }) {
  const status = statusConfig[laundry.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const logoUrl = getLaundryLogo(laundry.logo);

  return (
    <div className="laundry-card">
      <div className="laundry-card-header">
        <div className="laundry-logo-wrapper">
          {logoUrl ? (
            <img src={logoUrl} alt={laundry.name} className="laundry-logo-img" />
          ) : (
            <div className="laundry-logo-placeholder">
              <Store size={32} className="laundry-logo-icon" />
            </div>
          )}
        </div>
        <div className="laundry-header-info">
          <h3 className="laundry-name">{laundry.name}</h3>
          <span className={`laundry-status ${status.className}`}>
            <StatusIcon size={13} />
            {status.label}
          </span>
        </div>
        <div
          className={`laundry-active-dot ${laundry.isActive ? "active" : "inactive"}`}
          title={laundry.isActive ? "Active" : "Inactive"}
        />
      </div>

      <div className="laundry-divider" />

      <div className="laundry-details">
        {laundry.description && (
          <p className="laundry-description">{laundry.description}</p>
        )}
        <div className="laundry-meta">
          {laundry.address && (
            <div className="laundry-meta-row">
              <MapPin size={15} className="meta-icon" />
              <span>{laundry.address}</span>
            </div>
          )}
          {laundry.phone && (
            <div className="laundry-meta-row">
              <Phone size={15} className="meta-icon" />
              <span dir="ltr">{laundry.phone}</span>
            </div>
          )}
          {laundry.workingHours?.from && (
            <div className="laundry-meta-row">
              <Clock size={15} className="meta-icon" />
              <span>{formatTime12H(laundry.workingHours.from)} – {formatTime12H(laundry.workingHours.to)}</span>
            </div>
          )}
        </div>
        <div className="laundry-rating">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= Math.round(laundry.rating) ? "star filled" : "star empty"}
              />
            ))}
          </div>
          <span className="rating-value">{laundry.rating.toFixed(1)}</span>
          <span className="rating-count">({laundry.totalReviews} reviews)</span>
        </div>
      </div>

      <div className="laundry-card-footer gap-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenDocs(laundry)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition"
        >
          <FileText size={14} />
          Verification Documents
        </button>

        <Link to={`/laundries/${laundry._id}`} className="laundry-view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OwnerLaundries() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLaundryDocs, setSelectedLaundryDocs] = useState(null);

  const fetchLaundries = async () => {
    try {
      const data = await getOwnerLaundries();
      setLaundries(data.map(parseLaundryFields));
    } catch (err) {
      setError("Failed to load your laundries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaundries();
  }, []);

  function handleCreated(newLaundry) {
    if (newLaundry && newLaundry._id) {
      setLaundries((prev) => [parseLaundryFields(newLaundry), ...prev]);
    } else {
      fetchLaundries();
    }
  }

  return (
    <>
      <div className="owner-laundries-page">
        {/* Page Header */}
        <div className="owner-laundries-header">
          <div className="header-text">
            <h1 className="header-title">My Laundries</h1>
            <p className="header-subtitle">
              Manage and monitor all your laundry locations
            </p>
          </div>
          <div className="header-right">
            <div className="header-badge">
              <Store size={18} />
              {!loading && (
                <span>
                  {laundries.length} Location{laundries.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button className="add-laundry-btn" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Add Laundry
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="laundries-loading">
            <Loader2 size={40} className="spin" />
            <p>Loading your laundries…</p>
          </div>
        ) : error ? (
          <div className="laundries-error">
            <XCircle size={40} />
            <p>{error}</p>
          </div>
        ) : laundries.length === 0 ? (
          <div className="laundries-empty">
            <Store size={56} className="empty-icon" />
            <h2>No Laundries Yet</h2>
            <p>Click "Add Laundry" to create your first location.</p>
            <button className="add-laundry-btn" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Add Laundry
            </button>
          </div>
        ) : (
          <div className="laundries-grid">
            {laundries.map((l) => (
              <LaundryCard key={l._id} laundry={l} onOpenDocs={(laundry) => setSelectedLaundryDocs(laundry)} />
            ))}
          </div>
        )}
      </div>

      {/* Add Laundry Modal */}
      {showModal && (
        <AddLaundryModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Document Verification Modal */}
      {selectedLaundryDocs && (
        <DocumentVerificationModal
          laundry={selectedLaundryDocs}
          onClose={() => setSelectedLaundryDocs(null)}
          onUpdated={fetchLaundries}
        />
      )}
    </>
  );
}

