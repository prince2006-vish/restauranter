import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Bike,
  Sparkles,
  XCircle,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

const ORDER_STEPS = [
  {
    key: "Pending",
    label: "Order Received",
    desc: "Awaiting restaurant confirmation",
    icon: Clock,
  },
  {
    key: "Confirmed",
    label: "Confirmed",
    desc: "Order approved by restaurant",
    icon: CheckCircle,
  },
  {
    key: "Preparing",
    label: "In Kitchen",
    desc: "Master chef is preparing your meal",
    icon: ChefHat,
  },
  {
    key: "Ready for Pickup",
    label: "Packed & Ready",
    desc: "Freshly packed in kitchen",
    icon: PackageCheck,
  },
  {
    key: "Out for Delivery",
    label: "Out for Delivery",
    desc: "Delivery partner on the way",
    icon: Bike,
  },
  {
    key: "Delivered",
    label: "Delivered",
    desc: "Enjoy your royal feast!",
    icon: Sparkles,
  },
];

const TrackOrderPage = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState(
    paramOrderNumber || "",
  );
  const [activeOrderNumber, setActiveOrderNumber] = useState(
    paramOrderNumber || "",
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const { socket, isConnected } = useSocket();
  const { settings } = useSettings();
  const currency = settings.currencySymbol || "₹";

  const fetchOrderDetails = useCallback(
    async (numToFetch) => {
      if (!numToFetch) return;
      setLoading(true);
      setError("");
      try {
        const url = token
          ? `/orders/track/${numToFetch}?token=${token}`
          : `/orders/track/${numToFetch}`;
        const res = await api.get(url);
        if (res.data.success) {
          setOrder(res.data.order);
          setLastUpdated(new Date());
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not find order. Please verify order ID.",
        );
        setOrder(null);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // Fetch when active order number changes
  useEffect(() => {
    if (activeOrderNumber) {
      fetchOrderDetails(activeOrderNumber);
    }
  }, [activeOrderNumber, fetchOrderDetails]);

  // Socket.IO real-time listener
  useEffect(() => {
    if (!socket || !activeOrderNumber) return;

    // Join order room
    socket.emit("join_order_room", activeOrderNumber);

    const handleUpdate = (data) => {
      if (data.orderNumber?.toUpperCase() === activeOrderNumber.toUpperCase()) {
        toast.success(`Order update: Status changed to ${data.orderStatus}!`, {
          icon: "🔔",
        });
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            orderStatus: data.orderStatus,
            statusTimeline: data.statusTimeline || prev.statusTimeline,
            cancellationReason:
              data.cancellationReason || prev.cancellationReason,
            updatedAt: data.updatedAt || new Date(),
          };
        });
        setLastUpdated(new Date());
      }
    };

    socket.on("order_status_updated", handleUpdate);

    return () => {
      socket.emit("leave_order_room", activeOrderNumber);
      socket.off("order_status_updated", handleUpdate);
    };
  }, [socket, activeOrderNumber]);

  // Polling fallback every 20 seconds
  useEffect(() => {
    if (!activeOrderNumber) return;
    const interval = setInterval(() => {
      fetchOrderDetails(activeOrderNumber);
    }, 20000);
    return () => clearInterval(interval);
  }, [activeOrderNumber, fetchOrderDetails]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputOrderNumber.trim()) return;
    setActiveOrderNumber(inputOrderNumber.trim().toUpperCase());
    navigate(`/track-order/${inputOrderNumber.trim().toUpperCase()}`);
  };

  const getStatusIndex = (status) => {
    if (status === "Cancelled") return -1;
    return ORDER_STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIdx = order ? getStatusIndex(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === "Cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search */}
      <div className="text-center space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#12372A]">
          Live Order Tracking
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
          Watch your order progress in real-time from our tandoor and kitchen to
          your table.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-md mx-auto flex gap-2 pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputOrderNumber}
              onChange={(e) =>
                setInputOrderNumber(e.target.value.toUpperCase())
              }
              placeholder="Enter Order ID (e.g. MP-20261010-1234)"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-semibold uppercase rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Track
          </button>
        </form>
      </div>

      {/* Real-time Status Badge */}
      <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-100 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span>Real-Time Live Sync Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-stone-500">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Auto-refreshing via HTTP</span>
            </span>
          )}
        </div>

        {activeOrderNumber && (
          <button
            onClick={() => fetchOrderDetails(activeOrderNumber)}
            disabled={loading}
            className="flex items-center gap-1 text-[#12372A] hover:underline font-semibold"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh Now</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
          {error}
        </div>
      )}

      {/* Main Order Status Box */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Order ID
              </span>
              <h2 className="font-mono text-xl font-bold text-[#12372A]">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                  isCancelled
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : order.orderStatus === "Delivered"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {order.orderStatus}
              </span>
              {lastUpdated && (
                <p className="text-[10px] text-stone-400 mt-1">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Cancellation Notice */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-rose-900 block font-bold">
                  This order was cancelled
                </strong>
                <p className="text-xs text-rose-700 mt-0.5">
                  {order.cancellationReason ||
                    "Please contact our restaurant desk on WhatsApp for assistance."}
                </p>
              </div>
            </div>
          )}

          {/* Visual Step Progress Bar */}
          {!isCancelled && (
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ORDER_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                        isCurrent
                          ? "border-[#D4AF37] bg-[#12372A] text-white shadow-md scale-102"
                          : isDone
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                            : "border-stone-200 bg-stone-50 text-stone-400"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isCurrent
                            ? "bg-[#D4AF37] text-[#12372A]"
                            : isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          {step.label}
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 leading-tight ${
                            isCurrent ? "text-stone-300" : "text-stone-500"
                          }`}
                        >
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Timeline History */}
          {order.statusTimeline && order.statusTimeline.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900">
                Status Timeline
              </h3>
              <div className="space-y-3">
                {order.statusTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#12372A] shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <strong className="text-stone-900 font-semibold">
                          {item.status}
                        </strong>
                        <span className="text-stone-400 text-[10px]">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-stone-600 mt-0.5">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dishes Overview */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900">
                Dishes in This Order
              </h3>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <span className="text-stone-800 font-medium">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-stone-900 font-bold">
                      {currency}
                      {item.itemTotal || item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100 text-sm font-bold text-[#12372A]">
                <span>Total Amount:</span>
                <span>
                  {currency}
                  {order.totalAmount}
                </span>
              </div>
            </div>
          )}

          {/* Need help? Contact button */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl">
            <span className="text-xs text-stone-600">
              Have questions regarding your order delay or instructions?
            </span>
            <a
              href={`https://wa.me/${settings.whatsappPhone || "918853260723"}?text=${encodeURIComponent(`Hello Meetha Pani, I am inquiring about Order ${order.orderNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Kitchen</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
