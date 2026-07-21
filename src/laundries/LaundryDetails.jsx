import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Clock, Star, CheckCircle, XCircle,
  AlertCircle, Loader2, Store, ArrowLeft, Calendar,
  ToggleLeft, ToggleRight, Hash, Pencil, X, Trash2, ShieldAlert,
  Sparkles, ShoppingBag, Ticket, Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Navbar from "../component/Navbar/Navbar";
import { 
  getLaundryById, 
  updateLaundry, 
  deleteLaundry, 
  updateLaundryStatus, 
  getLaundryReviews, 
  createLaundryReview,
  updateLaundryReview,
  deleteLaundryReview
} from "../apicalls/laundry";
import {
  getLaundryCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from "../apicalls/coupon";
import { Domain } from "../utels/const";
import "./LaundryDetails.css";

/* ─── Helpers ─── */
const statusConfig = {
  pending:  { label: "Pending",  icon: AlertCircle, className: "det-status-pending"  },
  approved: { label: "Approved", icon: CheckCircle, className: "det-status-approved" },
  rejected: { label: "Rejected", icon: XCircle,     className: "det-status-rejected" },
};

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

/* ─── Coupons Modal ─── */
function CouponsModal({ laundryId, onClose }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrderAmount, setFormMinOrderAmount] = useState("");
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formUsagePerUser, setFormUsagePerUser] = useState("1");
  const [formValidFrom, setFormValidFrom] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formAppliesTo, setFormAppliesTo] = useState("all_services");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLaundryCoupons(laundryId);
      setCoupons(data);
    } catch (err) {
      toast.error(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [laundryId]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const resetForm = () => {
    setFormCode("");
    setFormTitle("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormMinOrderAmount("");
    setFormMaxDiscountAmount("");
    setFormUsageLimit("");
    setFormUsagePerUser("1");
    setFormValidFrom("");
    setFormExpiresAt("");
    setFormAppliesTo("all_services");
    setFormIsActive(true);
    setEditingCoupon(null);
    setShowAddForm(false);
  };

  const openEdit = (c) => {
    setEditingCoupon(c);
    setFormCode(c.code || "");
    setFormTitle(c.title || "");
    setFormDescription(c.description || "");
    setFormDiscountType(c.discountType || "percentage");
    setFormDiscountValue(c.discountValue ? c.discountValue.toString() : "");
    setFormMinOrderAmount(c.minOrderAmount ? c.minOrderAmount.toString() : "");
    setFormMaxDiscountAmount(c.maxDiscountAmount ? c.maxDiscountAmount.toString() : "");
    setFormUsageLimit(c.usageLimit ? c.usageLimit.toString() : "");
    setFormUsagePerUser(c.usagePerUser ? c.usagePerUser.toString() : "1");
    setFormValidFrom(c.validFrom ? c.validFrom.split("T")[0] : "");
    setFormExpiresAt(c.expiresAt ? c.expiresAt.split("T")[0] : "");
    setFormAppliesTo(c.appliesTo || "all_services");
    setFormIsActive(c.isActive !== false);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        laundryId,
        code: formCode.toUpperCase(),
        title: formTitle,
        description: formDescription,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minOrderAmount: formMinOrderAmount ? Number(formMinOrderAmount) : undefined,
        maxDiscountAmount: formMaxDiscountAmount ? Number(formMaxDiscountAmount) : undefined,
        usageLimit: formUsageLimit ? Number(formUsageLimit) : undefined,
        usagePerUser: formUsagePerUser ? Number(formUsagePerUser) : 1,
        validFrom: formValidFrom || undefined,
        expiresAt: formExpiresAt || undefined,
        appliesTo: formAppliesTo,
        isActive: formIsActive,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created successfully!");
      }
      resetForm();
      loadCoupons();
    } catch (err) {
      toast.error(err.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId) => {
    const res = await Swal.fire({
      title: "Delete Coupon?",
      text: "Are you sure you want to delete this coupon?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
    });
    if (res.isConfirmed) {
      try {
        await deleteCoupon(couponId);
        toast.success("Coupon deleted");
        loadCoupons();
      } catch (err) {
        toast.error(err.message || "Failed to delete coupon");
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box cpn-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap cpn-icon">
              <Ticket size={20} />
            </div>
            <h2 className="modal-title">Manage Laundry Coupons</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Action button */}
        {!showAddForm && (
          <div className="cpn-actions-row">
            <button className="btn-submit btn-edit" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Create New Coupon
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="modal-form cpn-form">
            <h3 className="cpn-form-title">{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Coupon Code <span className="required">*</span></label>
                <input
                  className="form-input font-mono uppercase font-bold"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Title <span className="required">*</span></label>
                <input
                  className="form-input"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 20% Discount"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Coupon for new customers"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount Type <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formDiscountType}
                  onChange={(e) => setFormDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Value <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(e.target.value)}
                  placeholder="e.g. 20"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Order Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formMinOrderAmount}
                  onChange={(e) => setFormMinOrderAmount(e.target.value)}
                  placeholder="e.g. 200"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Discount Cap ($)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formMaxDiscountAmount}
                  onChange={(e) => setFormMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Usage Limit</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Usage Per User</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formUsagePerUser}
                  onChange={(e) => setFormUsagePerUser(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Valid From</label>
                <input
                  type="date"
                  className="form-input"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expires At</label>
                <input
                  type="date"
                  className="form-input"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-submit btn-edit" disabled={submitting}>
                {submitting ? "Saving..." : (editingCoupon ? "Update Coupon" : "Create Coupon")}
              </button>
            </div>
          </form>
        ) : (
          /* Coupons List */
          <div className="cpn-list">
            {loading ? (
              <div className="det-center"><Loader2 size={24} className="det-spin" /></div>
            ) : coupons.length === 0 ? (
              <div className="cpn-empty">No coupons found for this laundry.</div>
            ) : (
              coupons.map((c) => (
                <div key={c._id} className="cpn-card">
                  <div className="cpn-card-left">
                    <span className="cpn-code-badge">{c.code}</span>
                    <div>
                      <p className="cpn-title">{c.title || c.code}</p>
                      <p className="cpn-desc">{c.description || `${c.discountValue}${c.discountType === "percentage" ? "%" : "$"} off`}</p>
                      <p className="cpn-meta">
                        Limit: {c.usedCount || 0}/{c.usageLimit || "∞"} | Expires: {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="cpn-card-actions">
                    <button className="cpn-btn-icon edit" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </button>
                    <button className="cpn-btn-icon delete" onClick={() => handleDelete(c._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
  const [showCoupons, setShowCoupons] = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getLaundryById(id);
        setLaundry(parseLaundryFields(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const data = await getLaundryReviews(id);
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    }
    load();
    loadReviews();
  }, [id]);

  const [togglingActive, setTogglingActive] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";
  const currentUserId = Cookies.get("userId");
  const ownerId = laundry?.ownerId?._id || laundry?.ownerId;
  const isLaundryOwner = ownerId === currentUserId;

  function handleUpdated(updated) {
    setLaundry((prev) => parseLaundryFields({ ...prev, ...updated }));
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

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (submittingReview) return;
    if (!newComment.trim()) {
      toast.error("Please add a comment for your review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await createLaundryReview({
        laundryId: id,
        rating: newRating,
        comment: newComment,
      });
      toast.success("Review submitted successfully!");
      setNewComment("");
      setNewRating(5);
      
      // Reload reviews and laundry rating
      const reviewsData = await getLaundryReviews(id);
      setReviews(reviewsData);
      const laundryData = await getLaundryById(id);
      setLaundry(laundryData);
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "You are about to permanently remove your review. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete It",
      cancelButtonText: "Cancel",
      background: "#fff",
      customClass: {
        popup: 'swal2-rounded-popup'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteLaundryReview(reviewId);
        toast.success("Review deleted successfully!");
        // Reload reviews and laundry rating
        const reviewsData = await getLaundryReviews(id);
        setReviews(reviewsData);
        const laundryData = await getLaundryById(id);
        setLaundry(laundryData);
      } catch (err) {
        toast.error(err.message || "Failed to delete review.");
      }
    }
  }

  async function handleUpdateReview(reviewId) {
    if (!editingComment.trim()) {
      toast.error("Review comment cannot be empty.");
      return;
    }
    setUpdatingReview(true);
    try {
      await updateLaundryReview(reviewId, {
        rating: editingRating,
        comment: editingComment,
      });
      toast.success("Review updated successfully!");
      setEditingReviewId(null);
      
      // Reload reviews and laundry rating
      const reviewsData = await getLaundryReviews(id);
      setReviews(reviewsData);
      const laundryData = await getLaundryById(id);
      setLaundry(laundryData);
    } catch (err) {
      toast.error(err.message || "Failed to update review.");
    } finally {
      setUpdatingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="det-center">
        <Loader2 size={44} className="det-spin" />
        <p>Loading laundry details…</p>
      </div>
    );
  }

  if (error || !laundry) {
    return (
      <div className="det-center det-error">
        <XCircle size={44} />
        <p>{error || "Laundry not found."}</p>
        <button className="det-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const status  = statusConfig[laundry.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const logoUrl = getLogo(laundry.logo);
  const [lng, lat] = laundry.location?.coordinates ?? [];

  return (
    <>
      <div className="det-page">

        {/* Top bar */}
        <div className="det-topbar">
          <div className="det-topbar-left">
            <button className="det-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back to My Laundries
            </button>
            <button
              className="det-services-btn"
              disabled={!laundry.isActive}
              title={!laundry.isActive ? "Laundry is inactive. Activate it to view services." : undefined}
              onClick={() => navigate(`/services/${laundry._id}`)}
            >
              <Sparkles size={16} /> View Services
            </button>
          </div>
          {isLaundryOwner && (
            <div className="det-topbar-actions">
              <button
                className="det-coupons-btn"
                disabled={!laundry.isActive}
                title={!laundry.isActive ? "Laundry is inactive. Activate it to manage coupons." : undefined}
                onClick={() => setShowCoupons(true)}
              >
                <Ticket size={16} /> Manage Coupons
              </button>
              <button
                className="det-orders-btn"
                disabled={!laundry.isActive}
                title={!laundry.isActive ? "Laundry is inactive. Activate it to view orders." : undefined}
                onClick={() => navigate(`/orders?laundryId=${laundry._id}`)}
              >
                <ShoppingBag size={16} /> View Orders
              </button>
              <button
                className="det-edit-btn"
                disabled={!laundry.isActive}
                title={!laundry.isActive ? "Laundry is inactive. Activate it to edit details." : undefined}
                onClick={() => setShowEdit(true)}
              >
                <Pencil size={16} /> Edit Laundry
              </button>
              <button className="det-delete-btn"
                onClick={() => { setDeleteError(""); setShowDelete(true); }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
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

        {/* Reviews Section */}
        <div className="det-reviews-section">
          <h2 className="det-reviews-title">💬 Customer Reviews</h2>
          
          <div className="det-reviews-container">
            {/* Left Column: List of Reviews */}
            <div className="det-reviews-list-wrap">
              {reviewsLoading ? (
                <div className="det-reviews-loading">
                  <Loader2 className="det-spin animate-spin" size={24} />
                  <span>Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="det-reviews-empty">
                  <span>No reviews yet. Be the first to leave one!</span>
                </div>
              ) : (
                <div className="det-reviews-list">
                  {reviews.map((rev) => {
                    const client = rev.clientId || {};
                    const avatarUrl = client.profileImage
                      ? (client.profileImage.startsWith("http") ? client.profileImage : `${Domain}/uploads/users/${client.profileImage}`)
                      : "https://www.w3schools.com/howto/img_avatar.png";
                    
                    const currentUserId = Cookies.get("userId");
                    // client can be object populated or simple string ID
                    const clientObjectId = client._id || client;
                    const isOwner = clientObjectId === currentUserId;
                    const canEditDelete = isOwner || isAdmin;
                    
                    const isEditingThis = editingReviewId === rev._id;

                    return (
                      <div key={rev._id} className="det-review-card">
                        {isEditingThis ? (
                          /* Inline Edit Mode */
                          <div className="det-review-edit-form">
                            <div className="det-rating-picker-group">
                              <label className="form-label">Edit Rating</label>
                              <div className="det-rating-picker-stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    type="button"
                                    key={s}
                                    onClick={() => setEditingRating(s)}
                                    className="det-rating-picker-star-btn"
                                  >
                                    <Star
                                      size={18}
                                      className={s <= editingRating ? "star-f fill-amber-400 text-amber-400" : "star-e text-gray-300"}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="form-group mt-2">
                              <label className="form-label">Edit Comment</label>
                              <textarea
                                className="form-input form-textarea"
                                value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                                rows={3}
                                required
                              />
                            </div>

                            <div className="flex gap-2 justify-end mt-3">
                              <button
                                type="button"
                                onClick={() => setEditingReviewId(null)}
                                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-100 transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={updatingReview}
                                onClick={() => handleUpdateReview(rev._id)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                              >
                                {updatingReview ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Display Mode */
                          <>
                            <div className="det-review-header">
                              <img src={avatarUrl} alt={client.fullname} className="det-review-avatar" />
                              <div className="det-review-meta">
                                <span className="det-review-author">{client.fullname || "Anonymous"}</span>
                                <span className="det-review-date">{formatDate(rev.createdAt)}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="det-review-stars">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={12}
                                      className={s <= Math.round(rev.rating) ? "star-f" : "star-e"}
                                    />
                                  ))}
                                </div>
                                {canEditDelete && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingReviewId(rev._id);
                                        setEditingRating(rev.rating || 5);
                                        setEditingComment(rev.comment || "");
                                      }}
                                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(rev._id)}
                                      className="text-[11px] font-bold text-red-650 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {rev.comment && <p className="det-review-comment">{rev.comment}</p>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Write a Review Form */}
            {isLaundryOwner ? (
              <div className="det-review-form-wrap" style={{ textAlign: 'center', backgroundColor: '#fffbeb', borderColor: '#fde68a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert className="text-amber-500" size={36} />
                <h3 className="det-review-form-title" style={{ margin: 0, color: '#92400e' }}>أنت مالك هذه المغسلة</h3>
                <p style={{ fontSize: '0.85rem', color: '#b45309', margin: 0, lineHeight: 1.5 }}>
                  بصفتك مالك المغسلة، لا يمكنك إضافة تقييم أو تعليق على عملك الخاص.
                </p>
                <div style={{ borderTop: '1px solid #fde68a', width: '100%', margin: '8px 0' }} />
                <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                  You own this laundry. Self-reviews are disabled.
                </span>
              </div>
            ) : (
              <div className="det-review-form-wrap">
                <h3 className="det-review-form-title">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="det-review-form">
                  {/* Rating Picker */}
                  <div className="det-rating-picker-group">
                    <label className="form-label">Your Rating</label>
                    <div className="det-rating-picker-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setNewRating(s)}
                          className="det-rating-picker-star-btn"
                        >
                          <Star
                            size={24}
                            className={s <= newRating ? "star-f fill-amber-400 text-amber-400" : "star-e text-gray-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="form-group">
                    <label className="form-label">Your Comment</label>
                    <textarea
                      className="form-input form-textarea"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this center..."
                      rows={4}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-submit btn-edit w-full"
                    style={{ marginTop: 8 }}
                  >
                    {submittingReview ? (
                      <><Loader2 size={16} className="det-spin animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              </div>
            )}
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

      {/* Coupons Modal */}
      {showCoupons && (
        <CouponsModal
          laundryId={laundry._id}
          onClose={() => setShowCoupons(false)}
        />
      )}
    </>
  );
}
