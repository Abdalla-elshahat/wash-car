import { useEffect, useState, useRef } from "react";
import { Domain } from "../../utels/const";
import Cookies from "js-cookie";
import {
  User, Mail, Phone, ShieldCheck, ShieldAlert, Calendar,
  Upload, AlertCircle, ShoppingBag, Edit, Award
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { deleteAccount } from "../../apicalls/users";

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

  useEffect(() => {
    fetchProfile();
  }, []);

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
        // Fetch interceptor will automatically append Bearer Token from cookies
      });

      if (response.ok) {
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchProfile(); // reload profile with fresh data
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
          
          // Clear cookies and logout
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

          {/* Cover/Header Gradient Banner */}
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
          <div className="pt-20 px-8 border-b border-gray-100 flex space-x-8">
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
              Orders ({userData.orders?.length || 0})
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

                {/* Info Card / Stats */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Activity Overview</h3>
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <Award className="w-8 h-8 opacity-80" />
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold border border-white/10 uppercase">
                        {userData.role}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black">
                        {userData.orders?.length || 0}
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
                        src={selectedFile ? URL.createObjectURL(selectedFile) : userData.profileImage}
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
                <h3 className="text-lg font-bold text-gray-900">Your Orders</h3>

                {userData.orders && userData.orders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {userData.orders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-5 border border-gray-100 rounded-2xl bg-gray-50 flex items-center justify-between hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Order #{idx + 1}</p>
                            <p className="text-xs text-gray-500">ID: {order._id || order}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-500">No orders placed yet</p>
                    <p className="text-sm text-gray-400 mt-1">Book services to see your orders here.</p>
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
