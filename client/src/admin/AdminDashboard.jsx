import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  Users,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();
  const { settings } = useSettings();
  const currency = settings.currencySymbol || '₹';

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, foodsRes, custsRes] = await Promise.all([
        api.get('/orders/admin/stats'),
        api.get('/orders/admin?limit=6'),
        api.get('/foods'),
        api.get('/customers/admin?limit=1'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data);
      if (foodsRes.data.success) setFoodCount(foodsRes.data.count || 0);
      if (custsRes.data.success) setCustomerCount(custsRes.data.total || 0);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time refresh when new order arrives or order updates
  useEffect(() => {
    if (!socket) return;
    socket.on('new_order_placed', fetchDashboardData);
    socket.on('order_status_changed_admin', fetchDashboardData);

    return () => {
      socket.off('new_order_placed', fetchDashboardData);
      socket.off('order_status_changed_admin', fetchDashboardData);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-medium">Aggregating live restaurant analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `${currency}${stats?.todayRevenue || 0}`,
      desc: `${stats?.todayOrders || 0} orders received today`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingOrders || 0,
      desc: 'Requires WhatsApp confirmation',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'In The Kitchen',
      value: stats?.preparingOrders || 0,
      desc: 'Freshly cooking right now',
      icon: ChefHat,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Delivered / Completed',
      value: stats?.deliveredOrders || 0,
      desc: `Total Revenue: ${currency}${stats?.totalRevenue || 0}`,
      icon: CheckCircle,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#12372A]">
            Kitchen & Sales Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time operations stream for {settings.restaurantName || 'Meetha Pani'}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs shadow-xs self-start sm:self-auto"
        >
          <span>Manage All Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-stone-500">{card.title}</span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{card.value}</h3>
                <p className="text-[11px] text-stone-400">{card.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Row: Secondary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 block">Total Lifetime Orders</span>
          <strong className="text-lg font-bold text-[#12372A]">{stats?.totalOrders || 0}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 block">Cancelled Orders</span>
          <strong className="text-lg font-bold text-rose-600">{stats?.cancelledOrders || 0}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 block">Total Active Dishes</span>
          <strong className="text-lg font-bold text-[#12372A]">{foodCount}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 block">Registered Customers</span>
          <strong className="text-lg font-bold text-[#12372A]">{customerCount}</strong>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif text-lg font-bold text-stone-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#12372A] hover:underline">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-stone-500 py-8 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#12372A]">
                        <Link to={`/admin/orders?search=${ord.orderNumber}`} className="hover:underline">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-stone-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-stone-400">{ord.customerPhone}</span>
                      </td>
                      <td className="py-3 capitalize text-stone-600">{ord.orderType}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-stone-900">
                        {currency}{ord.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Dishes (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Most Popular Dishes</h3>
          </div>

          <div className="space-y-3">
            {stats?.popularDishes && stats.popularDishes.length > 0 ? (
              stats.popularDishes.map((dish) => (
                <div key={dish._id} className="flex items-center gap-3">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{dish.name}</h4>
                    <p className="text-[10px] text-stone-500">
                      {currency}{dish.price} • Ordered {dish.orderCount || 0} times
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 text-center py-4">No dish stats available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
