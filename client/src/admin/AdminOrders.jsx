import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Printer,
  MessageSquare,
  Copy,
  Check,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & Action States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { socket } = useSocket();
  const { settings } = useSettings();
  const currency = settings.currencySymbol || '₹';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/orders/admin?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalOrders(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time update when orders change
  useEffect(() => {
    if (!socket) return;
    socket.on('new_order_placed', fetchOrders);
    socket.on('order_status_changed_admin', fetchOrders);

    return () => {
      socket.off('new_order_placed', fetchOrders);
      socket.off('order_status_changed_admin', fetchOrders);
    };
  }, [socket, fetchOrders]);

  const handleOpenStatusModal = (ord) => {
    setStatusUpdateModal(ord);
    setNewStatus(ord.orderStatus);
    setStatusNote('');
    setCancellationReason('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusUpdateModal) return;

    if (newStatus === 'Cancelled' && !cancellationReason.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/orders/admin/${statusUpdateModal.orderNumber}/status`, {
        orderStatus: newStatus,
        note: statusNote.trim(),
        cancellationReason: cancellationReason.trim(),
      });

      if (res.data.success) {
        toast.success(`Order #${statusUpdateModal.orderNumber} status changed to ${newStatus}`);
        setStatusUpdateModal(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintReceipt = (ord) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt #${ord.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 13px; max-width: 400px; margin: auto; }
            h2, h3 { text-align: center; margin: 4px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .bold { font-weight: bold; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>${settings.restaurantName || 'MEETHA PANI'}</h2>
          <div class="center">${settings.address || ''}</div>
          <div class="center">Phone: ${settings.contactPhone || ''}</div>
          <div class="divider"></div>
          <div class="row"><span class="bold">Order ID:</span><span>${ord.orderNumber}</span></div>
          <div class="row"><span>Date:</span><span>${new Date(ord.createdAt).toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Customer:</span><span>${ord.customerName}</span></div>
          <div class="row"><span>Phone:</span><span>${ord.customerPhone}</span></div>
          <div class="row"><span>Type:</span><span class="bold">${ord.orderType.toUpperCase()}</span></div>
          ${ord.deliveryAddress ? `<div><span class="bold">Address:</span> ${ord.deliveryAddress}</div>` : ''}
          <div class="divider"></div>
          <div class="bold">ORDER ITEMS:</div>
          ${ord.items.map((it) => `<div class="row"><span>${it.name} x ${it.quantity}</span><span>₹${it.itemTotal}</span></div>`).join('')}
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>₹${ord.subtotal}</span></div>
          ${ord.discount > 0 ? `<div class="row"><span>Discount:</span><span>-₹${ord.discount}</span></div>` : ''}
          <div class="row"><span>Delivery Charges:</span><span>₹${ord.deliveryFee}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 15px;"><span>TOTAL AMOUNT:</span><span>₹${ord.totalAmount}</span></div>
          <div class="divider"></div>
          ${ord.customerInstructions ? `<div><span class="bold">Special Instructions:</span> ${ord.customerInstructions}</div><div class="divider"></div>` : ''}
          <div class="center" style="margin-top: 15px;">Thank you for dining with Meetha Pani!</div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">Order Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track, update kitchen progress, and fulfill orders ({totalOrders} total)
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, name, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">No orders match the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dishes</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Order ID & Time */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#12372A] block">{ord.orderNumber}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <strong className="text-stone-900 block font-semibold">{ord.customerName}</strong>
                      <span className="text-[11px] text-stone-500 block">{ord.customerPhone}</span>
                    </td>

                    {/* Order Type */}
                    <td className="py-3 px-4 capitalize font-medium text-stone-700">
                      {ord.orderType}
                    </td>

                    {/* Dishes summary */}
                    <td className="py-3 px-4 max-w-xs truncate text-stone-600">
                      {ord.items?.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {currency}{ord.totalAmount}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : ord.orderStatus === 'Preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                        title="Click to update status"
                      >
                        {ord.orderStatus} ▾
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Modal */}
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Receipt */}
                      <button
                        onClick={() => handlePrintReceipt(ord)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="Print Order Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct WhatsApp Customer */}
                      <a
                        href={`https://wa.me/${ord.customerWhatsapp || ord.customerPhone}?text=${encodeURIComponent(`Hello ${ord.customerName}, regarding your Meetha Pani order #${ord.orderNumber}: `)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors inline-block"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-stone-100 rounded-md disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-stone-100 rounded-md disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Order Information</span>
                <h3 className="font-mono text-xl font-bold text-[#12372A]">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-800 font-bold text-xl">
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-stone-50 p-4 rounded-2xl text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block">Customer</span>
                  <strong className="text-stone-900">{selectedOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Contact Phone</span>
                  <span className="text-stone-900">{selectedOrder.customerPhone}</span>
                </div>
              </div>
              <div>
                <span className="text-stone-400 block">Order Mode</span>
                <span className="capitalize font-semibold text-stone-900">{selectedOrder.orderType}</span>
              </div>
              {selectedOrder.orderType === 'delivery' && (
                <div>
                  <span className="text-stone-400 block">Delivery Address</span>
                  <p className="text-stone-900">{selectedOrder.deliveryAddress} {selectedOrder.landmark && `(Near: ${selectedOrder.landmark})`}</p>
                </div>
              )}
              {selectedOrder.customerInstructions && (
                <div>
                  <span className="text-stone-400 block">Customer Instructions</span>
                  <p className="text-stone-900 italic font-medium">"{selectedOrder.customerInstructions}"</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Order Items</h4>
              <div className="divide-y divide-stone-100 text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span>{it.name} × {it.quantity}</span>
                    <strong className="text-stone-900">{currency}{it.itemTotal}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-stone-100 text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>{currency}{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{currency}{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery:</span>
                <span>{currency}{selectedOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#12372A] pt-1 border-t border-stone-100">
                <span>Grand Total:</span>
                <span>{currency}{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => handlePrintReceipt(selectedOrder)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  handleOpenStatusModal(selectedOrder);
                }}
                className="px-4 py-2 bg-[#12372A] text-white text-xs font-semibold rounded-xl"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#12372A]">
                Update Order #{statusUpdateModal.orderNumber}
              </h3>
              <button onClick={() => setStatusUpdateModal(null)} className="text-stone-400 hover:text-stone-800 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'Cancelled' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Cancellation Reason *</label>
                  <input
                    type="text"
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="e.g. Out of delivery range, Kitchen overloaded..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Timeline Custom Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched with valet Rameshwar (+91 98765 00000)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500">
                Notice: Updating this status immediately broadcasts to the customer's live tracking screen via Socket.IO without requiring page reload.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStatusUpdateModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 text-xs font-bold bg-[#12372A] hover:bg-[#1F4D3C] text-white rounded-xl shadow-xs"
                >
                  {updatingStatus ? 'Updating...' : 'Save & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
