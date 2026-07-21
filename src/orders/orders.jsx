import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrdersByLaundryId, updateOrderStatus } from "../apicalls/order";
import { getOwnerLaundries } from "../apicalls/laundry";
import {
  ShoppingBag, Filter, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, Clock, XCircle, AlertTriangle, CreditCard, Tag, User, Phone, FileText, MapPin
} from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const PAYMENT_METHODS = [
  { label: "All Payment Methods", value: "" },
  { label: "Card", value: "card" },
  { label: "Online", value: "online" },
  { label: "Stripe", value: "stripe" },
];

export default function Orders() {
  const [searchParams] = useSearchParams();
  const laundryIdFromQuery = searchParams.get("laundryId");

  const [laundries, setLaundries] = useState([]);
  const [selectedLaundryId, setSelectedLaundryId] = useState(laundryIdFromQuery || "");
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch laundries for selector
  useEffect(() => {
    getOwnerLaundries()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setLaundries(list);
        if (laundryIdFromQuery) {
          setSelectedLaundryId(laundryIdFromQuery);
        } else if (list.length > 0) {
          setSelectedLaundryId(list[0]._id);
        }
      })
      .catch((err) => {
        console.error("Error fetching laundries:", err);
        if (laundryIdFromQuery) {
          setSelectedLaundryId(laundryIdFromQuery);
        }
      });
  }, [laundryIdFromQuery]);

  const fetchOrders = useCallback(async () => {
    if (!selectedLaundryId) return;
    setLoading(true);
    try {
      const res = await getOrdersByLaundryId(selectedLaundryId, {
        status,
        paymentMethod,
        page,
        limit,
      });
      setOrders(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalItems || 0);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedLaundryId, status, paymentMethod, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Order status changed to ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchOrders();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Laundry Orders</h1>
              <p className="text-sm text-slate-500">Manage and track orders by laundry</p>
            </div>
          </div>

          {/* Laundry Selector */}
          {laundries.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Select Laundry:</label>
              <select
                value={selectedLaundryId}
                onChange={(e) => {
                  setSelectedLaundryId(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-100 text-slate-800 text-sm font-medium rounded-xl border-none focus:ring-2 focus:ring-blue-500 px-4 py-2.5"
              >
                {laundries.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Order Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_METHODS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-between items-end">
            <span className="text-sm font-medium text-slate-600">
              Total Orders: <strong className="text-slate-900">{totalItems}</strong>
            </span>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Orders List / Cards */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 font-medium">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-800">No orders found</h3>
            <p className="text-sm text-slate-500">Try adjusting your status or payment method filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Info Block */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      #{order._id?.slice(-8)}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-1">
                    {/* Client */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Client</span>
                        <p className="font-semibold text-slate-800">{order.customerName || order.clientId?.fullname || "Guest Client"}</p>
                        {(order.phone || order.clientId?.phone) && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {order.phone || order.clientId?.phone}
                          </p>
                        )}
                        {order.address && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {order.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Service */}
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Service</span>
                        <p className="font-semibold text-slate-800">{order.serviceId?.title || "N/A"}</p>
                        <p className="text-xs text-slate-500">
                          Price: ${order.serviceId?.price ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Financials & Payment */}
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Payment</span>
                        <p className="font-semibold text-slate-800 capitalize">
                          {order.paymentMethod || "N/A"} ({order.paymentStatus || "pending"})
                        </p>
                        {order.discountAmount > 0 && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Discount: -${order.discountAmount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p><strong className="text-slate-700">Notes:</strong> {order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions & Status Control */}
                <div className="flex flex-col sm:flex-row lg:flex-col justify-end items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-slate-400 mb-1 text-right">Update Status:</label>
                    <select
                      disabled={updatingId === order._id}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="w-full bg-slate-100 border-none font-semibold text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}