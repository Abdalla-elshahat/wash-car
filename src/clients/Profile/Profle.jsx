import { useEffect, useState, useRef, useCallback } from "react";
import { Domain } from "../../utels/const";
import Cookies from "js-cookie";
import {
  User, Mail, Phone, ShieldCheck, ShieldAlert, Calendar,
  Upload, AlertCircle, ShoppingBag, Edit, Award, Clock,
  CheckCircle, XCircle, RefreshCw, CreditCard, Tag, FileText,
  ChevronLeft, ChevronRight, Store, MapPin
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { deleteAccount } from "../../apicalls/users";
import { getClientOrders, cancelClientOrder } from "../../apicalls/order";

function getLaundryLogoUrl(logo) {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return `${Domain}/uploads/laundries/${logo}`;
}

function getServiceImgUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("uploads/")) return `${Domain}/${img}`;
  return `${Domain}/uploads/services/${img}`;
}

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Form states for editing
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Client Orders State
  const [clientOrders, setClientOrders] = useState([]);
  const [clientOrdersLoading, setClientOrdersLoading] = useState(false);
  const [clientOrdersError, setClientOrdersError] = useState("");
  const [clientOrdersPage, setClientOrdersPage] = useState(1);
  const [clientOrdersTotalPages, setClientOrdersTotalPages] = useState(1);
  const [clientOrdersTotalItems, setClientOrdersTotalItems] = useState(0);

  const fileInputRef = useRef(null);

  // Fetch Profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${Domain}/users/me`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setFullname(data.fullname || "");
        setPhone(data.phone || "");
        setImagePreview(
          data.profileImage
            ? `${Domain}/uploads/users/${data.profileImage}`
            : "https://www.w3schools.com/howto/img_avatar.png"
        );
      } else {
        setError("Failed to fetch user data.");
      }
    } catch (err) {
      setError("An error occurred while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientOrders = useCallback(async (pageNum = 1) => {
    setClientOrdersLoading(true);
    setClientOrdersError("");
    try {
      const res = await getClientOrders({ page: pageNum, limit: 10 });
      setClientOrders(res.data || []);
      setClientOrdersPage(res.currentPage || 1);
      setClientOrdersTotalPages(res.totalPages || 1);
      setClientOrdersTotalItems(res.totalItems || 0);
    } catch (err) {
      setClientOrdersError(err.message || "Failed to load orders");
    } finally {
      setClientOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchClientOrders(clientOrdersPage);
    }
  }, [activeTab, clientOrdersPage, fetchClientOrders]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("phone", phone);
    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }

    try {
      const response = await fetch(`${Domain}/users`, {
        method: "PATCH",
        body: formData,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchProfile();
        setActiveTab("overview");
      } else {
        const errData = await response.json();
        toast.error(`Update failed: ${errData.message || "Unknown error"}`, {
          position: "top-right",
        });
      }
    } catch (err) {
      toast.error("Error updating profile. Please try again.", {
        position: "top-right",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Cancel Order",
    });

    if (result.isConfirmed) {
      try {
        await cancelClientOrder(orderId);
        toast.success("Order cancelled successfully");
        fetchClientOrders(clientOrdersPage);
      } catch (err) {
        toast.error(err.message || "Failed to cancel order");
      }
    }
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you cannot recover or re-register this email except through an Admin. Please contact support at: 01115337822.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#3B82F6",
      confirmButtonText: "Yes, delete my account!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAccount();
          Swal.fire({
            title: "Deleted!",
            text: "Your account has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          Cookies.remove("token");
          Cookies.remove("refreshToken");
          Cookies.remove("userId");

          setTimeout(() => {
            window.location.href = "/signup";
          }, 2000);
        } catch (err) {
          Swal.fire("Error!", err.message || "Failed to delete account.", "error");
        }
      }
    });
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">Error Loading Profile</h3>
        <p className="text-red-600 mt-2">{error || "Could not retrieve user info."}</p>
        <button
          onClick={fetchProfile}
          className="mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const joinDate = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
    : "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Main Card container */}
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">

          {/* Cover/Header Banner */}
          <div className="h-48 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 relative">
            <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end space-x-6">
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt={userData.fullname}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                />
                {activeTab === "edit" && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Upload className="w-6 h-6" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {userData.fullname}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    {userData.role}
                  </span>
                  {userData.isVerified ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="pt-20 px-8 border-b border-gray-100 flex flex-wrap gap-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-semibold tracking-wide transition-all duration-200 border-b-2 ${activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-4 text-sm font-semibold tracking-wide transition-all duration-200 border-b-2 ${activeTab === "edit"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-sm font-semibold tracking-wide transition-all duration-200 border-b-2 ${activeTab === "orders"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              My Orders ({clientOrdersTotalItems || userData.orders?.length || 0})
            </button>
          </div>

          {/* Card Content Section */}
          <div className="p-8">
            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User details list */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Full Name</p>
                        <p className="text-sm font-semibold text-gray-800">{userData.fullname}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Email Address</p>
                        <p className="text-sm font-semibold text-gray-800">{userData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {userData.phone || "No phone added"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Member Since</p>
                        <p className="text-sm font-semibold text-gray-800">{joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Overview */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Activity Overview</h3>
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <Award className="w-8 h-8 opacity-80" />
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> View My Orders
                      </button>
                    </div>
                    <div>
                      <p className="text-2xl font-black">
                        {clientOrdersTotalItems || userData.orders?.length || 0}
                      </p>
                      <p className="text-xs text-indigo-100 font-medium mt-1 uppercase tracking-wide">
                        Total Wash Orders
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-xs text-indigo-100 flex items-center justify-between">
                      <span>Status</span>
                      <span className="font-semibold text-white">
                        {userData.isVerified ? "Verified Account" : "Verification Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile Tab Content */}
            {activeTab === "edit" && (
              <>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                  <h3 className="text-lg font-bold text-gray-900">Update Profile Details</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Profile Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-200 transition-all duration-200"
                        >
                          Choose Image
                        </button>
                        <img
                          src={selectedFile ? URL.createObjectURL(selectedFile) : imagePreview}
                          alt="Preview"
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Danger Zone: Delete Account */}
                <div className="mt-12 pt-8 border-t border-red-100 max-w-xl">
                  <h4 className="text-md font-bold text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Once you delete your account, this email address cannot be re-registered or accessed without admin assistance. For support, please contact: 01115337822.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold border border-red-200 transition-all duration-200"
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {/* Orders Tab Content */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">My Orders</h3>
                    <p className="text-xs text-gray-500">Track and view all your car wash orders</p>
                  </div>
                  <button
                    onClick={() => fetchClientOrders(1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${clientOrdersLoading ? "animate-spin" : ""}`} /> Refresh
                  </button>
                </div>

                {clientOrdersLoading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
                  </div>
                ) : clientOrdersError ? (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">{clientOrdersError}</p>
                    <button
                      onClick={() => fetchClientOrders(1)}
                      className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                ) : clientOrders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">No orders placed yet</p>
                    <p className="text-sm text-gray-400 mt-1">Book services to see your orders here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        {/* Left Column: Laundry & Service Details */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                              #{order._id?.slice(-8)}
                            </span>
                            {getStatusBadge(order.status)}
                            <span className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            {/* Laundry Info */}
                            <div className="flex items-start space-x-3">
                              {order.laundryId?.logo ? (
                                <img
                                  src={getLaundryLogoUrl(order.laundryId.logo)}
                                  alt={order.laundryId.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                  <Store className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Laundry</span>
                                <p className="font-bold text-gray-900 text-sm">{order.laundryId?.name || "Wash Service"}</p>
                                {order.laundryId?.address && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-gray-400" /> {order.laundryId.address}
                                  </p>
                                )}
                                {order.laundryId?.phone && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-gray-400" /> {order.laundryId.phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Service Info */}
                            <div className="flex items-start space-x-3">
                              {order.serviceId?.image ? (
                                <img
                                  src={getServiceImgUrl(order.serviceId.image)}
                                  alt={order.serviceId.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                  <Tag className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Service</span>
                                <p className="font-bold text-gray-900 text-sm">{order.serviceId?.title || "Service Details"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-extrabold text-indigo-600">
                                    ${order.totalAmount ?? order.originalPrice ?? 0}
                                  </span>
                                  {order.discountAmount > 0 && (
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      -${order.discountAmount} Off
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment, Contact, Address & Notes */}
                          <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-1 text-gray-600 font-medium capitalize">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {order.paymentMethod || "N/A"} ({order.paymentStatus || "pending"})
                            </span>
                            {order.customerName && (
                              <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                <User className="w-3.5 h-3.5 text-gray-400" /> {order.customerName}
                              </span>
                            )}
                            {order.phone && (
                              <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                <Phone className="w-3.5 h-3.5 text-gray-400" /> {order.phone}
                              </span>
                            )}
                            {order.address && (
                              <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {order.address}
                              </span>
                            )}
                            {order.notes && (
                              <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <FileText className="w-3.5 h-3.5 text-gray-400" /> Note: {order.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Actions */}
                        {(order.status === "pending" || order.status === "accepted") && (
                          <div className="flex justify-end items-center shrink-0">
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {clientOrdersTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      disabled={clientOrdersPage <= 1}
                      onClick={() => setClientOrdersPage((prev) => Math.max(1, prev - 1))}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs font-medium text-gray-600">
                      Page {clientOrdersPage} of {clientOrdersTotalPages}
                    </span>
                    <button
                      disabled={clientOrdersPage >= clientOrdersTotalPages}
                      onClick={() => setClientOrdersPage((prev) => Math.min(clientOrdersTotalPages, prev + 1))}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
