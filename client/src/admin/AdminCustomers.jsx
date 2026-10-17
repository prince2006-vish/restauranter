import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { settings } = useSettings();
  const currency = settings.currencySymbol || '₹';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = searchQuery.trim()
        ? `/customers/admin?search=${encodeURIComponent(searchQuery.trim())}`
        : '/customers/admin';
      const res = await api.get(url);
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleToggleStatus = async (cust) => {
    const nextStatus = cust.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await api.patch(`/customers/admin/${cust._id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Customer account ${nextStatus === 'blocked' ? 'suspended' : 'reactivated'}`);
        setCustomers((prev) =>
          prev.map((c) => (c._id === cust._id ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (err) {
      toast.error('Failed to change customer status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">Registered Customers</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Customer directory, order counts, and lifetime spends ({total} accounts)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or mobile number..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-4">
                      <strong className="text-stone-900 block font-semibold">{cust.name}</strong>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{cust.email}</div>
                      <div className="text-stone-400 text-[11px]">{cust.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(cust.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {cust.totalOrders || 0}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#12372A]">
                      {currency}{cust.totalSpent || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(cust)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          cust.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {cust.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
