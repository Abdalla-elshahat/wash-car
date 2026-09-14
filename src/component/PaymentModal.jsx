import React, { useState } from "react";
import {
  CreditCard,
  XCircle,
  Loader2,
  X,
  Lock,
  Store,
  ShieldCheck,
} from "lucide-react";
import { createPaymentIntent } from "../apicalls/payment";
import { toast } from "react-toastify";

export default function PaymentModal({ order, amount, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderId = order?._id || order?.id || order?.orderId;
  const totalAmount = amount || order?.totalAmount || order?.originalPrice || 0;
  const serviceName = order?.serviceId?.title || order?.serviceName || "Car Wash Service";
  const laundryName = order?.laundryId?.name || order?.laundryName || "Wash Center";

  const handlePayNow = async () => {
    if (!orderId) {
      toast.error("Invalid Order ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create/fetch the Paymob payment intention on the backend, then hand off
      // to Paymob's hosted checkout page for card entry and 3D Secure.
      const intentRes = await createPaymentIntent(orderId, totalAmount);
      const checkoutUrl = intentRes.checkoutUrl || intentRes.payment?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Payment checkout link is not available. Please try again.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment processing failed. Please try again.");
      toast.error(err.message || "Payment failed.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl">
              <CreditCard size={24} className="text-indigo-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Checkout & Payment</h2>
              <p className="text-xs text-indigo-200">Secured by Paymob</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 max-h-[80vh]">
          {/* Order Summary Box */}
          <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider">Order Summary</span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">{serviceName}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Store size={12} className="text-indigo-400" /> {laundryName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total</span>
              <span className="text-lg font-black text-indigo-700">{totalAmount} EGP</span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-2xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <XCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Compliance Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>سيتم تحويلك إلى صفحة الدفع الآمنة من Paymob لإدخال بيانات البطاقة (PCI Compliant).</span>
          </div>

          <button
            onClick={handlePayNow}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Redirecting to Paymob...
              </>
            ) : (
              <>
                <Lock size={16} /> Pay {totalAmount} EGP Securely
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
