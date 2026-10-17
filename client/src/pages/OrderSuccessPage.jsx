import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Clock,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { settings } = useSettings();

  const stateData = location.state || {};
  const [order, setOrder] = useState(stateData.order || null);
  const [whatsappUrl, setWhatsappUrl] = useState(stateData.whatsappUrl || "");
  const [whatsappMessage, setWhatsappMessage] = useState(
    stateData.whatsappMessage || "",
  );
  const [loading, setLoading] = useState(!stateData.order);
  const [copied, setCopied] = useState(false);

  // If page was reloaded directly, fetch order details via tracking API
  useEffect(() => {
    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/track/${orderNumber}`);
          if (res.data.success && res.data.order) {
            setOrder(res.data.order);
            if (res.data.order.whatsappMessageText) {
              setWhatsappMessage(res.data.order.whatsappMessageText);
              const phone = settings.whatsappPhone || "918853260723";
              setWhatsappUrl(
                `https://wa.me/${phone}?text=${encodeURIComponent(res.data.order.whatsappMessageText)}`,
              );
            }
          }
        } catch (err) {
          console.error("Error fetching order:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderNumber, settings.whatsappPhone]);

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      // Record click on backend
      api
        .patch(`/orders/track/${orderNumber}/whatsapp-initiated`)
        .catch(() => {});
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyMessage = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      toast.success("WhatsApp order text copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const currency = settings.currencySymbol || "₹";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 text-sm font-medium">
          Loading order confirmation...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#12372A]">
          Order Ticket Generated!
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Your order has been recorded in the Meetha Pani kitchen system.
        </p>
        <div className="inline-block bg-[#12372A] text-[#D4AF37] font-mono text-sm font-bold px-4 py-1.5 rounded-full shadow-xs">
          Order ID: {orderNumber}
        </div>
      </div>

      {/* WHATSAPP ACTION CALLOUT */}
      <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-sm space-y-6 text-center">
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
            Step 2: Confirm via WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            Please click the green button below to open WhatsApp with your
            prefilled order summary.
            <strong className="block mt-1 text-emerald-900">
              ⚠️ Remember to press "Send" in WhatsApp so our chef receives your
              confirmation!
            </strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-base shadow-lg transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Send Order via WhatsApp</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </button>

          <button
            onClick={handleCopyMessage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white hover:bg-emerald-100/50 text-emerald-900 font-semibold text-xs border border-emerald-300 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? "Copied to Clipboard" : "Copy Message Text"}</span>
          </button>
        </div>
      </div>

      {/* Order Details Snapshot */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-[#12372A]">
              Order Receipt Details
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Status: {order.orderStatus || "Pending"}
            </span>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl">
            <div>
              <span className="text-stone-400 block mb-0.5">Customer Name</span>
              <strong className="text-stone-900 text-sm">
                {order.customerName}
              </strong>
            </div>
            <div>
              <span className="text-stone-400 block mb-0.5">Order Type</span>
              <strong className="text-stone-900 capitalize text-sm">
                {order.orderType}
              </strong>
            </div>
            {order.orderType === "delivery" && (
              <div className="sm:col-span-2">
                <span className="text-stone-400 block mb-0.5">
                  Delivery Address
                </span>
                <span className="text-stone-800">
                  {order.deliveryAddress}{" "}
                  {order.landmark && `(Near: ${order.landmark})`}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Dishes Ordered
              </h4>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-stone-900">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-stone-900">
                      {currency}
                      {item.itemTotal || item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Totals */}
          <div className="pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {currency}
                {order.subtotal}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount:</span>
                <span>
                  -{currency}
                  {order.discount}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>
                {currency}
                {order.deliveryFee}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#12372A] pt-2 border-t border-stone-100">
              <span>Grand Total:</span>
              <span className="font-serif text-xl">
                {currency}
                {order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to={`/track-order/${orderNumber}${order?.guestTrackingToken ? `?token=${order.guestTrackingToken}` : ""}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-white font-bold text-xs tracking-wide transition-all shadow-md"
        >
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <span>Track Order Status Live</span>
        </Link>

        <Link
          to="/menu"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
