import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShoppingBag, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const MyOrdersPage = () => {
  const { customer, isCustomerAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currency = settings.currencySymbol || '₹';

  useEffect(() => {
    if (!isCustomerAuthenticated) {
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isCustomerAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-stone-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">My Account</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#12372A] mt-1">
            Welcome, {customer?.name}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {customer?.email} • {customer?.phone}
          </p>
        </div>

        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs shadow-xs"
        >
          <span>Order Fresh Food</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900">
          Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-stone-700 text-lg">No Orders Placed Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Your order history will appear here once you place your first order with us.
            </p>
            <Link
              to="/menu"
              className="inline-block px-5 py-2.5 bg-[#12372A] text-white rounded-xl text-xs font-bold"
            >
              Browse Menu Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#12372A] bg-stone-100 px-2.5 py-1 rounded-md">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • <span className="capitalize">{order.orderType}</span>
                  </p>

                  <div className="text-xs text-stone-700 line-clamp-1">
                    {order.items?.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <span className="font-serif font-bold text-lg text-[#12372A]">
                    {currency}{order.totalAmount}
                  </span>

                  <Link
                    to={`/track-order/${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-[#12372A] hover:text-white text-stone-800 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track Status</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
