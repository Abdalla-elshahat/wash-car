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
} from "lucide-react";
import Navbar from "../component/Navbar/Navbar";
import { getOwnerLaundries, createLaundry } from "../apicalls/laundry";
import { Domain } from "../utels/const";
import "./OwnerLaundries.css";

/* ─── Status config ─── */
const statusConfig = {
  pending:  { label: "Pending",  icon: AlertCircle, className: "status-pending"  },
  approved: { label: "Approved", icon: CheckCircle, className: "status-approved" },
  rejected: { label: "Rejected", icon: XCircle,     className: "status-rejected" },
};

function getLaundryLogo(logo) {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return `${Domain}/uploads/laundries/${logo}`;
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

/* ─── Add Laundry Modal ─── */
function AddLaundryModal({ onClose, onCreated }) {
  const [form, setForm] = useState(defaultForm);
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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
        name: form.name,
        description: form.description,
        phone: form.phone,
        address: form.address,
        location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
        workingHours: { from: form.workingFrom, to: form.workingTo },
        logo: logoFile,  // File object — API function appends it to FormData
      };
      const created = await createLaundry(payload);
      onCreated(created);
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
            <div className="modal-icon-wrap">
              <Store size={20} />
            </div>
            <h2 className="modal-title">Add New Laundry</h2>
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
            <label className="form-label">
              <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
              Location Coordinates
            </label>
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

          {error && <p className="form-error">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={16} className="spin" /> Creating…</>
              ) : (
                <><Plus size={16} /> Create Laundry</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Laundry Card ─── */
function LaundryCard({ laundry }) {
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
              <span>{laundry.workingHours.from} – {laundry.workingHours.to}</span>
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

      <div className="laundry-card-footer">
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

  useEffect(() => {
    async function load() {
      try {
        const data = await getOwnerLaundries();
        setLaundries(data);
      } catch (err) {
        setError("Failed to load your laundries. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleCreated(newLaundry) {
    if (newLaundry && newLaundry._id) {
      setLaundries((prev) => [newLaundry, ...prev]);
    } else {
      // If server doesn't return the created object, refetch
      getOwnerLaundries().then(setLaundries).catch(() => {});
    }
  }

  return (
    <>
      <Navbar />
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
              <LaundryCard key={l._id} laundry={l} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddLaundryModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
