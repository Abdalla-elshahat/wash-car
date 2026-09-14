import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { getPaymentByOrderId } from "../apicalls/payment";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | paid | pending | failed

  const orderId = searchParams.get("merchant_order_id") || searchParams.get("order");
  const paymobSuccess = searchParams.get("success");

  useEffect(() => {
    if (!orderId) {
      setStatus(paymobSuccess === "true" ? "pending" : "failed");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const payment = await getPaymentByOrderId(orderId);
        if (cancelled) return;

        if (payment?.status === "paid") {
          setStatus("paid");
          return;
        }
        if (payment?.status === "failed") {
          setStatus("failed");
          return;
        }

        attempts += 1;
        if (attempts >= MAX_POLLS) {
          setStatus("pending");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!cancelled) setStatus("pending");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymobSuccess]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 p-8 text-center space-y-6">
        {status === "checking" && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Confirming your payment...</h2>
            <p className="text-sm text-slate-500">Please wait while we verify the transaction with Paymob.</p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle size={56} className="mx-auto text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-sm text-slate-500">Your order has been paid and is now being processed.</p>
          </>
        )}

        {status === "pending" && (
          <>
            <Loader2 size={48} className="mx-auto text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Payment Pending</h2>
            <p className="text-sm text-slate-500">
              We're still waiting for confirmation from Paymob. Check your order status shortly.
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={56} className="mx-auto text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Payment Failed</h2>
            <p className="text-sm text-slate-500">Your payment could not be completed. Please try again.</p>
          </>
        )}

        <button
          onClick={() => navigate("/profile")}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <span>Go to My Orders</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
