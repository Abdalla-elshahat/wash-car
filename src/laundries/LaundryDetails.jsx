import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Clock, Star, CheckCircle, XCircle,
  AlertCircle, Loader2, Store, ArrowLeft, Calendar,
  ToggleLeft, ToggleRight, Hash, Pencil, X, Trash2, ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../component/Navbar/Navbar";
import { getLaundryById, updateLaundry, deleteLaundry, updateLaundryStatus } from "../apicalls/laundry";
import { Domain } from "../utels/const";
import "./LaundryDetails.css";

/* ─── Helpers ─── */
const statusConfig = {
  pending:  { label: "Pending",  icon: AlertCircle, className: "det-status-pending"  },
  approved: { label: "Approved", icon: CheckCircle, className: "det-status-approved" },
  rejected: { label: "Rejected", icon: XCircle,     className: "det-status-rejected" },
};

function getLogo(logo) {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return `${Domain}/uploads/laundries/${logo}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

/* ─── Info Row ─── */
function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="det-info-row">
      <div className="det-info-icon"><Icon size={16} /></div>
      <div className="det-info-body">
        <span className="det-info-label">{label}</span>
        <span className={`det-info-value ${mono ? "mono" : ""}`}>{value}</span>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteModal({ laundryName, onClose, onConfirm, deleting, error }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box del-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="del-warning-icon">
          <ShieldAlert size={36} />
        </div>
        <h2 className="del-title">Delete Laundry?</h2>
        <p className="del-subtitle">
          You are about to permanently delete <strong>&#8220;{laundryName}&#8221;</strong>.
        </p>
        <div className="del-warning-box">
          <XCircle size={16} className="del-warning-ico" />
          <span>
            This action <strong>cannot be undone</strong>. The laundry can only
            be restored by a system administrator.
          </span>
        </div>
        {error && <p className="form-error del-form-error">{error}</p>}
        <div className="modal-actions del-actions">
          <button className="btn-cancel" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn-submit btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><Loader2 size={16} className="det-spin" /> Deleting&#8230;</>
              : <><Trash2 size={16} /> Yes, Delete Permanently</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─── */
function EditModal({ laundry, onClose, onUpdated }) {
  const existingLogo = laundry.logo
    ? (laundry.logo.startsWith("http") ? laundry.logo : `${Domain}/uploads/laundries/${laundry.logo}`)
    : null;

  const [form, setForm] = useState({
    name:        laundry.name        ?? "",
    description: laundry.description ?? "",
    phone:       laundry.phone       ?? "",
    address:     laundry.address     ?? "",
    lat:         laundry.location?.coordinates?.[1]?.toString() ?? "",
    lng:         laundry.location?.coordinates?.[0]?.toString() ?? "",
    workingFrom: laundry.workingHours?.from ?? "09:00",
    workingTo:   laundry.workingHours?.to   ?? "22:00",
  });
  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState(existingLogo);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name:        form.name,
        description: form.description,
        phone:       form.phone,
        address:     form.address,
        location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
        workingHours: { from: form.workingFrom, to: form.workingTo },
        logo: logoFile, // File object if changed, undefined if not
      };
      const updated = await updateLaundry(laundry._id, payload);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap edit-icon">
              <Pencil size={18} />
            </div>
            <h2 className="modal-title">Edit Laundry</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Logo Upload */}
          <div className="form-group">
            <label className="form-label">Logo</label>
            <div className="logo-upload-row">
              {logoPreview ? (
                <img src={logoPreview} alt="preview" className="logo-preview" />
              ) : (
                <div className="logo-preview-placeholder"><Store size={22} /></div>
              )}
              <label className="logo-upload-btn">
                <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                {logoFile ? "Change Image" : (existingLogo ? "Replace Image" : "Choose Image")}
              </label>
              {logoFile && <span className="logo-filename">{logoFile.name}</span>}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Laundry Name <span className="required">*</span></label>
            <input className="form-input" name="name" value={form.name}
              onChange={handleChange} placeholder="e.g. Clean Car Wash" required />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" name="description"
              value={form.description} onChange={handleChange}
              placeholder="Brief description…" rows={3} />
          </div>

          {/* Phone + Address */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone <span className="required">*</span></label>
              <input className="form-input" name="phone" value={form.phone}
                onChange={handleChange} placeholder="01000000000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Address <span className="required">*</span></label>
              <input className="form-input" name="address" value={form.address}
                onChange={handleChange} placeholder="Cairo, Egypt" required />
            </div>
          </div>

          {/* Coordinates */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
              Location Coordinates
            </label>
            <div className="form-row">
              <div className="form-group">
                <input className="form-input" name="lat" value={form.lat}
                  onChange={handleChange} placeholder="Latitude" type="number" step="any" />
                <span className="form-hint">Latitude</span>
              </div>
              <div className="form-group">
                <input className="form-input" name="lng" value={form.lng}
                  onChange={handleChange} placeholder="Longitude" type="number" step="any" />
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
                <input className="form-input" type="time" name="workingFrom"
                  value={form.workingFrom} onChange={handleChange} />
                <span className="form-hint">Opens at</span>
              </div>
              <div className="form-group">
                <input className="form-input" type="time" name="workingTo"
                  value={form.workingTo} onChange={handleChange} />
                <span className="form-hint">Closes at</span>
              </div>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit btn-edit" disabled={submitting}>
              {submitting
                ? <><Loader2 size={16} className="det-spin" /> Saving…</>
                : <><Pencil size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LaundryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laundry, setLaundry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [showEdit,    setShowEdit]   = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getLaundryById(id);
        setLaundry(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const [togglingActive, setTogglingActive] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";

  function handleUpdated(updated) {
    setLaundry((prev) => ({ ...prev, ...updated }));
  }

  async function handleToggleActive() {
    if (!isAdmin || togglingActive) return;
    setTogglingActive(true);
    try {
      const nextStatus = laundry.status === "approved" ? "pending" : "approved";
      const updated = await updateLaundryStatus(laundry._id, nextStatus);
      handleUpdated(updated);
      toast.success(`Laundry status successfully set to ${nextStatus}!`);
    } catch (err) {
      toast.error(err.message || "Failed to toggle status");
    } finally {
      setTogglingActive(false);
    }
  }

  async function handleDelete() {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteLaundry(laundry._id);
      navigate("/laundries/owner", { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="det-center">
          <Loader2 size={44} className="det-spin" />
          <p>Loading laundry details…</p>
        </div>
      </>
    );
  }

  if (error || !laundry) {
    return (
      <>
        <Navbar />
        <div className="det-center det-error">
          <XCircle size={44} />
          <p>{error || "Laundry not found."}</p>
          <button className="det-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </>
    );
  }

  const status  = statusConfig[laundry.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const logoUrl = getLogo(laundry.logo);
  const [lng, lat] = laundry.location?.coordinates ?? [];

  return (
    <>
      <Navbar />
      <div className="det-page">

        {/* Top bar */}
        <div className="det-topbar">
          <button className="det-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back to My Laundries
          </button>
          <div className="det-topbar-actions">
            <button className="det-edit-btn" onClick={() => setShowEdit(true)}>
              <Pencil size={16} /> Edit Laundry
            </button>
            <button className="det-delete-btn"
              onClick={() => { setDeleteError(""); setShowDelete(true); }}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="det-hero">
          <div className="det-hero-left">
            {logoUrl ? (
              <img src={logoUrl} alt={laundry.name} className="det-logo-img" />
            ) : (
              <div className="det-logo-placeholder">
                <Store size={40} />
              </div>
            )}
            <div>
              <h1 className="det-name">{laundry.name}</h1>
              {laundry.description && (
                <p className="det-description">{laundry.description}</p>
              )}
              <div className="det-badges">
                <span className={`det-status-badge ${status.className}`}>
                  <StatusIcon size={13} /> {status.label}
                </span>
                <span 
                  className={`det-active-badge ${laundry.isActive ? "det-active" : "det-inactive"} ${isAdmin ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
                  onClick={isAdmin ? handleToggleActive : undefined}
                  style={isAdmin ? { userSelect: "none" } : undefined}
                  title={isAdmin ? "Click to toggle active status" : undefined}
                >
                  {togglingActive ? (
                    <><Loader2 size={14} className="det-spin animate-spin" /> Updating...</>
                  ) : laundry.isActive ? (
                    <><ToggleRight size={14} /> Active</>
                  ) : (
                    <><ToggleLeft  size={14} /> Inactive</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Rating pill */}
          <div className="det-rating-pill">
            <div className="det-rating-stars">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16}
                  className={s <= Math.round(laundry.rating) ? "star-f" : "star-e"} />
              ))}
            </div>
            <span className="det-rating-num">{laundry.rating.toFixed(1)}</span>
            <span className="det-rating-count">{laundry.totalReviews} reviews</span>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="det-grid">

          {/* Contact & Location */}
          <div className="det-card">
            <h2 className="det-card-title">📍 Contact & Location</h2>
            <div className="det-info-list">
              <InfoRow icon={MapPin} label="Address"     value={laundry.address} />
              <InfoRow icon={Phone}  label="Phone"       value={laundry.phone} mono />
              {lat && lng && (
                <InfoRow icon={MapPin} label="Coordinates"
                  value={`${lat}° N, ${lng}° E`} mono />
              )}
            </div>
            {lat && lng && (
              <a href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank" rel="noopener noreferrer" className="det-map-link">
                <MapPin size={14} /> Open in Google Maps
              </a>
            )}
          </div>

          {/* Working Hours */}
          <div className="det-card">
            <h2 className="det-card-title">⏰ Working Hours</h2>
            <div className="det-hours-block">
              <div className="det-hours-row">
                <Clock size={16} className="det-hours-icon" />
                <div>
                  <p className="det-hours-label">Opens at</p>
                  <p className="det-hours-time">{laundry.workingHours?.from ?? "—"}</p>
                </div>
              </div>
              <div className="det-hours-divider" />
              <div className="det-hours-row">
                <Clock size={16} className="det-hours-icon" />
                <div>
                  <p className="det-hours-label">Closes at</p>
                  <p className="det-hours-time">{laundry.workingHours?.to ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="det-card">
            <h2 className="det-card-title">🗂️ System Info</h2>
            <div className="det-info-list">
              <InfoRow icon={Hash}     label="ID"      value={laundry._id} mono />
              <InfoRow icon={Calendar} label="Created" value={formatDate(laundry.createdAt)} />
              <InfoRow icon={Calendar} label="Updated" value={formatDate(laundry.updatedAt)} />
            </div>
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          laundry={laundry}
          onClose={() => setShowEdit(false)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDelete && (
        <DeleteModal
          laundryName={laundry.name}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </>
  );
}
