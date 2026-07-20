import { useEffect, useState } from 'react';
import { Domain } from '../utels/const';
import Navbar from '../component/Navbar/Navbar';
import Addclient from './addclient';
import EditClient from './edite';
import Swal from 'sweetalert2';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Store,
  Search,
  Filter,
  Grid,
  List,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Edit3,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserX,
  Activity,
  RotateCcw
} from 'lucide-react';

function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const limit = 5;

  async function getUsers(page = 1) {
    try {
      setLoading(true);
      const res = await fetch(`${Domain}/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch users from server.');
      }
      const data = await res.json();
      setUsers(data.data || []);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching users.');
    } finally {
      setLoading(false);
    }
  }

  async function returnUser(id) {
    const confirmResult = await Swal.fire({
      title: 'Restore User?',
      text: 'Do you want to restore this user account/email?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, restore!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-gray-100',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-150 shadow-sm'
      }
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await fetch(`${Domain}/users/return`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: id }),
        });

        if (res.ok) {
          Swal.fire({
            title: 'Restored!',
            text: 'The user account has been successfully restored.',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-2xl'
            }
          });
          getUsers(currentPage);
        } else {
          const errData = await res.json().catch(() => ({}));
          Swal.fire({
            title: 'Error!',
            text: errData.message || 'Something went wrong.',
            icon: 'error',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Network Error!',
          text: 'Could not connect to the server.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl'
          }
        });
      }
    }
  }

  useEffect(() => {
    getUsers(currentPage);
  }, [currentPage, showForm, showEditForm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getUserAvatar = (profileImage) => {
    if (!profileImage) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    if (profileImage.startsWith('http')) return profileImage;
    return `${Domain}/uploads/users/${profileImage}`;
  };

  // Client side filtration matching search query, role filter, status filter
  const filteredUsers = users.filter(user => {
    const nameMatch = user.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = user.phone?.includes(searchQuery);
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = user.isActive === true || user.isActive === 'true';
    } else if (statusFilter === 'inactive') {
      matchesStatus = user.isActive === false || user.isActive === 'false';
    } else if (statusFilter === 'verified') {
      matchesStatus = user.isVerified === true;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics from the current list or general stats
  const activeCount = users.filter(u => u.isActive === true || u.isActive === 'true').length;
  const verifiedCount = users.filter(u => u.isVerified === true).length;
  const laundryOwnerCount = users.filter(u => u.role === 'laundry_owner').length;

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 pb-16">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white py-10 px-6 shadow-lg mb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-white/15 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                System Management
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
                User & Client Directory
              </h1>
              <p className="text-indigo-100 text-sm md:text-base mt-2 max-w-2xl opacity-90">
                Manage your system users, admin profiles, laundry owners, and clients. Review verification status, active roles, and total order volume.
              </p>
            </div>

            {/* {localStorage.getItem("userRole")?.toLowerCase() === 'admin' && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3 px-6 rounded-xl transition duration-200 shadow-md hover:scale-[1.02] transform active:scale-95"
              >
                <Plus size={18} />
                <span>Add New User</span>
              </button>
            )} */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Directory</p>
                <h3 className="text-xl font-bold text-gray-800 mt-0.5">{totalUsers} Users</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Now</p>
                <h3 className="text-xl font-bold text-gray-800 mt-0.5">{activeCount} / {users.length} Listed</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Store size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Laundry Owners</p>
                <h3 className="text-xl font-bold text-gray-800 mt-0.5">{laundryOwnerCount} Owner(s)</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Verified users</p>
                <h3 className="text-xl font-bold text-gray-800 mt-0.5">{verifiedCount} Account(s)</h3>
              </div>
            </div>
          </div>

          {/* Filtering and Actions Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <Filter size={14} className="text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-600 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="laundry_owner">Laundry Owner</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <Activity size={14} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-600 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden p-0.5 bg-gray-50 ml-auto md:ml-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => getUsers(currentPage)}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl transition hover:text-gray-700"
                title="Refresh list"
              >
                <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
              </button>
            </div>
          </div>

          {/* Users List Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="relative flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
                <Users className="absolute text-indigo-600 animate-pulse" size={24} />
              </div>
              <p className="text-gray-500 font-medium mt-4">Loading active users directory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 text-center max-w-lg mx-auto shadow-sm">
              <UserX className="mx-auto text-red-400 mb-3" size={48} />
              <p className="font-bold text-lg mb-1">Failed to Load Users</p>
              <p className="text-sm opacity-90">{error}</p>
              <button
                onClick={() => getUsers(currentPage)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-16 text-center max-w-lg mx-auto shadow-sm">
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-800">No Users Match Filters</h3>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search query to locate users.</p>
              <button
                onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}
                className="mt-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-2 px-5 rounded-xl text-sm transition"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredUsers.map((user) => {
                const isActiveUser = user.isActive === true || user.isActive === 'true';
                const ordersCount = user.orders ? user.orders.length : 0;

                return (
                  <div
                    key={user._id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex flex-col group hover:scale-[1.01] transform"
                  >
                    {/* Header cover decoration */}
                    <div className="h-20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 relative">
                      <div className="absolute right-4 top-4 flex gap-1.5">
                        {/* Role Badge */}
                        <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border shadow-sm ${user.role?.toLowerCase() === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200/50'
                            : user.role?.toLowerCase() === 'laundry_owner'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                          }`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 flex-1 flex flex-col -mt-10">
                      {/* Avatar */}
                      <div className="relative self-start mb-4">
                        <img
                          src={getUserAvatar(user.profileImage)}
                          alt={user.fullname}
                          className="w-18 h-18 rounded-2xl object-cover border-4 border-white shadow-md bg-gray-100"
                        />
                        {/* Active status bubble */}
                        <span className={`absolute bottom-0.5 right-0.5 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center shadow ${isActiveUser ? 'bg-green-500' : 'bg-gray-400'
                          }`} title={isActiveUser ? "Active" : "Inactive"}>
                          {isActiveUser ? (
                            <CheckCircle size={10} className="text-white font-black" />
                          ) : (
                            <XCircle size={10} className="text-white font-black" />
                          )}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition">
                            {user.fullname || "Anonymous User"}
                          </h3>
                          {user.isVerified && (
                            <span className="text-blue-500" title="Verified Account">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium">ID: {user._id}</p>
                      </div>

                      <hr className="my-4 border-gray-100" />

                      {/* Attributes */}
                      <div className="space-y-3 text-sm text-gray-600 flex-1">
                        <div className="flex items-center gap-2.5">
                          <Mail size={16} className="text-gray-400 shrink-0" />
                          <span className="truncate" title={user.email}>{user.email}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Phone size={16} className="text-gray-400 shrink-0" />
                          <span>{user.phone || <em className="text-gray-400">No phone provided</em>}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2.5">
                            <ShoppingBag size={16} className="text-gray-400 shrink-0" />
                            <span className="font-semibold text-gray-700">{ordersCount}</span>
                            <span className="text-gray-400 text-xs">orders</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                            <Calendar size={12} />
                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {localStorage.getItem("userRole")?.toLowerCase() === 'admin' && (
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-50">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditForm(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-gray-200 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 text-sm font-semibold transition"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          {!isActiveUser && (
                            <button
                              onClick={() => returnUser(user._id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-green-150 hover:border-green-200 text-green-600 hover:bg-green-50/50 text-sm font-semibold transition"
                            >
                              <RotateCcw size={14} />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                    {filteredUsers.map((user) => {
                      const isActiveUser = user.isActive === true || user.isActive === 'true';
                      const ordersCount = user.orders ? user.orders.length : 0;

                      return (
                        <tr key={user._id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={getUserAvatar(user.profileImage)}
                                alt={user.fullname}
                                className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0 shadow-sm"
                              />
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-gray-800">{user.fullname}</span>
                                  {user.isVerified && (
                                    <span className="text-blue-500" title="Verified">
                                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">ID: {user._id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border ${user.role?.toLowerCase() === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : user.role?.toLowerCase() === 'laundry_owner'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                              {user.role?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                <Mail size={12} className="text-gray-400" />
                                <span className="text-xs">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Phone size={12} />
                                <span className="text-xs">{user.phone || 'No phone'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isActiveUser ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActiveUser ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span>{isActiveUser ? 'Active' : 'Inactive'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag size={14} className="text-gray-400" />
                              <span className="font-semibold text-gray-700">{ordersCount}</span>
                              <span className="text-gray-400 text-xs">orders</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {localStorage.getItem("userRole")?.toLowerCase() === 'admin' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditForm(true);
                                  }}
                                  className="p-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-500 hover:text-indigo-600 rounded-xl transition"
                                  title="Edit user"
                                >
                                  <Edit3 size={14} />
                                </button>
                                {!isActiveUser && (
                                  <button
                                    onClick={() => returnUser(user._id)}
                                    className="p-2 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 text-green-500 hover:text-green-600 rounded-xl transition"
                                    title="Restore user"
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalUsers} total users)
            </span>

            <div className="flex items-center gap-2">
              <button
                className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Render page selection dynamically
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`h-9 w-9 text-sm font-semibold rounded-xl transition flex items-center justify-center ${currentPage === pageNumber
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Overlay (Left-Aligned Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="relative w-full max-w-lg transform scale-100 transition-all duration-300">
            <Addclient
              clients={users}
              setClients={setUsers}
              setShowForm={setShowForm}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="relative w-full max-w-lg transform scale-100 transition-all duration-300">
            <EditClient
              client={selectedUser}
              setClients={setUsers}
              setShowEditForm={setShowEditForm}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Clients;
