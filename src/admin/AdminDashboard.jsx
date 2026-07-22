import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  getAdminDashboardStats,
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUserRole,
  getAdminOrders,
} from "../apicalls/admin";
import { updateLaundryStatus, getAllLaundries } from "../apicalls/laundry";
import { Domain } from "../utels/const";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [usersData, setUsersData] = useState({ data: [], total: 0, currentPage: 1, totalPages: 1 });
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [usersPage, setUsersPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);

  // Orders State
  const [ordersData, setOrdersData] = useState({ data: [], total: 0, currentPage: 1, totalPages: 1 });
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [ordersPage, setOrdersPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Laundries State
  const [laundriesData, setLaundriesData] = useState({ data: [], total: 0, currentPage: 1, totalPages: 1 });
  const [laundryStatusFilter, setLaundryStatusFilter] = useState("all");
  const [laundriesPage, setLaundriesPage] = useState(1);
  const [loadingLaundries, setLoadingLaundries] = useState(false);
  const [actionLaundryId, setActionLaundryId] = useState(null);

  // 1. Fetch Overview Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getAdminDashboardStats();
      setStats(res);
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await getAdminUsers(userSearch, userRoleFilter, usersPage, 8);
      setUsersData(res);
    } catch (err) {
      toast.error(err.message || "Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, userRoleFilter, usersPage]);

  // 3. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await getAdminOrders(orderStatusFilter, orderSearch, ordersPage, 8);
      setOrdersData(res);
    } catch (err) {
      toast.error(err.message || "Failed to load orders list");
    } finally {
      setLoadingOrders(false);
    }
  }, [orderStatusFilter, orderSearch, ordersPage]);

  // 4. Fetch Laundries
  const fetchLaundries = useCallback(async () => {
    try {
      setLoadingLaundries(true);
      const filters = laundryStatusFilter !== "all" ? { status: laundryStatusFilter } : {};
      const res = await getAllLaundries(laundriesPage, 8, filters);
      setLaundriesData(res);
    } catch (err) {
      toast.error(err.message || "Failed to load laundries");
    } finally {
      setLoadingLaundries(false);
    }
  }, [laundryStatusFilter, laundriesPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab, fetchOrders]);

  useEffect(() => {
    if (activeTab === "laundries") fetchLaundries();
  }, [activeTab, fetchLaundries]);

  // User Actions
  const handleToggleUserStatus = async (user) => {
    try {
      setActionUserId(user._id);
      const newStatus = !user.isActive;
      await toggleAdminUserStatus(user._id, newStatus);
      toast.success(`User ${user.fullname} is now ${newStatus ? "Active" : "Deactivated"}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setActionUserId(null);
    }
  };

  const handleUpdateRole = async (user, newRole) => {
    try {
      setActionUserId(user._id);
      await updateAdminUserRole(user._id, newRole);
      toast.success(`Role updated for ${user.fullname}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setActionUserId(null);
    }
  };

  // Laundry Status Toggle
  const handleToggleLaundryStatus = async (laundryId, status) => {
    try {
      setActionLaundryId(laundryId);
      await updateLaundryStatus(laundryId, status);
      toast.success(`Laundry status updated to ${status}`);
      fetchLaundries();
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Failed to update laundry status");
    } finally {
      setActionLaundryId(null);
    }
  };

  const getUserAvatar = (image) => {
    if (!image) return "https://www.w3schools.com/howto/img_avatar.png";
    if (image.startsWith("http")) return image;
    return `${Domain}/uploads/users/${image}`;
  };

  const getLaundryLogo = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `${Domain}/uploads/laundries/${logo}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-16 transition-colors duration-200">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm py-8 px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Admin Master Dashboard <Sparkles size={20} className="text-amber-500 animate-pulse" />
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Real-time platform metrics, user management, laundry verifications & order analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={() => {
                fetchStats();
                if (activeTab === "users") fetchUsers();
                if (activeTab === "orders") fetchOrders();
                if (activeTab === "laundries") fetchLaundries();
                toast.info("Dashboard refreshed");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loadingStats ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>
            <Link
              to="/admin/laundries/inactive"
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20"
            >
              <FileText size={14} />
              <span>Inactive Verification ({stats?.laundries?.pending || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Users */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-indigo-500/50 transition group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loadingStats ? "..." : stats?.users?.total || 0}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition">
                <Users size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Clients: <strong className="text-indigo-600 dark:text-indigo-400">{stats?.users?.clients || 0}</strong></span>
              <span>Owners: <strong className="text-emerald-600 dark:text-emerald-400">{stats?.users?.owners || 0}</strong></span>
            </div>
          </div>

          {/* Card 2: Laundries */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-emerald-500/50 transition group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Laundries</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loadingStats ? "..." : stats?.laundries?.total || 0}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-110 transition">
                <Store size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Active: <strong className="text-emerald-600 dark:text-emerald-400">{stats?.laundries?.active || 0}</strong></span>
              <span>Pending: <strong className="text-amber-600 dark:text-amber-400">{stats?.laundries?.pending || 0}</strong></span>
            </div>
          </div>

          {/* Card 3: Orders */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-blue-500/50 transition group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Orders</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loadingStats ? "..." : stats?.orders?.total || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition">
                <ShoppingBag size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Completed: <strong className="text-emerald-600 dark:text-emerald-400">{stats?.orders?.completed || 0}</strong></span>
              <span>In Progress: <strong className="text-blue-600 dark:text-blue-400">{stats?.orders?.inProgress || 0}</strong></span>
            </div>
          </div>

          {/* Card 4: Revenue */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-amber-500/50 transition group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Financials</p>
                <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  ${loadingStats ? "0" : (stats?.financials?.totalRevenue || 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-500/20 group-hover:scale-110 transition">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Earnings Fee: <strong className="text-amber-700 dark:text-amber-300">${(stats?.financials?.platformEarnings || 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto mb-6 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "users", label: "Users Management", icon: Users },
            { id: "laundries", label: "Laundries", icon: Store },
            { id: "orders", label: "Orders Stream", icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition duration-150 whitespace-nowrap ${isActive
                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 rounded-t-xl"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Platform Activity</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All Orders <ArrowUpRight size={14} />
                  </button>
                </div>

                {loadingStats ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">Loading recent activity...</p>
                ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No recent orders logged.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Laundry</th>
                          <th className="pb-3 font-semibold">Amount</th>
                          <th className="pb-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                        {stats.recentOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                            <td className="py-3 pr-2">
                              <div className="font-bold text-slate-900 dark:text-slate-200">
                                {order.clientId?.fullname || order.customerName || "Customer"}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{order.phone || "No phone"}</div>
                            </td>
                            <td className="py-3 pr-2 text-slate-700 dark:text-slate-300">
                              {order.laundryId?.name || "Laundry Center"}
                            </td>
                            <td className="py-3 pr-2 font-bold text-amber-600 dark:text-amber-400">
                              ${order.totalAmount || 0}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "completed"
                                    ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                    : order.status === "cancelled"
                                      ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                                      : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                                  }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pending Verifications Widget */}
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-amber-500 dark:text-amber-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Pending Verification</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    {stats?.laundries?.pending || 0} laundry center(s) are awaiting admin document approval before going live.
                  </p>

                  {stats?.recentLaundries && stats.recentLaundries.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      {stats.recentLaundries.map((laundry) => (
                        <div
                          key={laundry._id}
                          className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{laundry.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Owner: {laundry.ownerId?.fullname || "N/A"}</p>
                          </div>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-center text-xs text-emerald-700 dark:text-emerald-400 mb-6">
                      ✨ All pending applications cleared!
                    </div>
                  )}
                </div>

                <Link
                  to="/admin/laundries/inactive"
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Review Pending Documents
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUsersPage(1);
                  }}
                  placeholder="Search user name, email, phone..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal size={16} className="text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Role:</span>
                {["all", "client", "laundry_owner", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRoleFilter(r);
                      setUsersPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${userRoleFilter === r
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">Loading users...</p>
            ) : usersData.data.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">No users match your criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {usersData.data.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getUserAvatar(user.profileImage)}
                              alt={user.fullname}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                            />
                            <span className="font-bold text-slate-900 dark:text-slate-200">{user.fullname}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-700 dark:text-slate-300">{user.email}</td>
                        <td className="py-3.5 pr-3 text-slate-500 dark:text-slate-400">{user.phone || "—"}</td>
                        <td className="py-3.5 pr-3">
                          <select
                            value={user.role}
                            disabled={actionUserId === user._id}
                            onChange={(e) => handleUpdateRole(user, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                          >
                            <option value="client">Client</option>
                            <option value="laundry_owner">Laundry Owner</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3.5 pr-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user.isActive !== false
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                              }`}
                          >
                            {user.isActive !== false ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={actionUserId === user._id}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${user.isActive !== false
                                ? "bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                                : "bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                              }`}
                          >
                            {user.isActive !== false ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LAUNDRIES */}
        {activeTab === "laundries" && (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter Status:</span>
              {["all", "approved", "pending", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setLaundryStatusFilter(s);
                    setLaundriesPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${laundryStatusFilter === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loadingLaundries ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">Loading laundries...</p>
            ) : !laundriesData.data || laundriesData.data.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">No laundries found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {laundriesData.data.map((laundry) => {
                  const logo = getLaundryLogo(laundry.logo);
                  return (
                    <div
                      key={laundry._id}
                      className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {logo ? (
                              <img src={logo} alt={laundry.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                <Store size={20} />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{laundry.name}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{laundry.phone || "No phone"}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${laundry.status === "approved"
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : laundry.status === "rejected"
                                  ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                                  : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              }`}
                          >
                            {laundry.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                          {laundry.address || laundry.description || "No address specified"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                        <Link
                          to={`/laundries/${laundry._id}`}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          View Details <Eye size={12} />
                        </Link>
                        {laundry.status !== "approved" ? (
                          <button
                            onClick={() => handleToggleLaundryStatus(laundry._id, "approved")}
                            disabled={actionLaundryId === laundry._id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleLaundryStatus(laundry._id, "rejected")}
                            disabled={actionLaundryId === laundry._id}
                            className="px-3 py-1 bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold rounded-lg transition"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value);
                    setOrdersPage(1);
                  }}
                  placeholder="Search order customer name or address..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setOrderStatusFilter(st);
                      setOrdersPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${orderStatusFilter === st
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {loadingOrders ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">Loading orders stream...</p>
            ) : !ordersData.data || ordersData.data.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Laundry</th>
                      <th className="pb-3 font-semibold">Service</th>
                      <th className="pb-3 font-semibold">Total Price</th>
                      <th className="pb-3 font-semibold">Payment</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {ordersData.data.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px] pr-3">
                          #{ord._id?.substring(ord._id.length - 6)}
                        </td>
                        <td className="py-3.5 pr-3">
                          <div className="font-bold text-slate-900 dark:text-slate-200">
                            {ord.clientId?.fullname || ord.customerName || "Walk-in"}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{ord.phone || "No phone"}</div>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-700 dark:text-slate-300 font-medium">
                          {ord.laundryId?.name || "Center"}
                        </td>
                        <td className="py-3.5 pr-3 text-slate-700 dark:text-slate-300">
                          {ord.serviceId?.name || "Car Wash Service"}
                        </td>
                        <td className="py-3.5 pr-3 font-bold text-amber-600 dark:text-amber-400">
                          ${ord.totalAmount || 0}
                        </td>
                        <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-400 capitalize">
                          {ord.paymentMethod || "Cash/Online"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ord.status === "completed"
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : ord.status === "cancelled"
                                  ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                                  : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
