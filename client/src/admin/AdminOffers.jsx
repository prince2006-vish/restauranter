import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    isActive: true,
    validTill: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers/admin');
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      isActive: true,
      validTill: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (off) => {
    setEditingOffer(off);
    setFormData({
      title: off.title,
      code: off.code,
      description: off.description || '',
      discountType: off.discountType || 'percentage',
      discountValue: off.discountValue?.toString() || '',
      minOrderAmount: off.minOrderAmount?.toString() || '',
      maxDiscountAmount: off.maxDiscountAmount?.toString() || '',
      isActive: off.isActive !== undefined ? off.isActive : true,
      validTill: off.validTill ? new Date(off.validTill).toISOString().slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.code || !formData.discountValue) {
      toast.error('Title, code, and discount value are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
        validTill: formData.validTill ? new Date(formData.validTill) : null,
      };

      if (editingOffer) {
        const res = await api.put(`/offers/admin/${editingOffer._id}`, payload);
        if (res.data.success) {
          toast.success('Offer updated successfully');
          setIsModalOpen(false);
          fetchOffers();
        }
      } else {
        const res = await api.post('/offers/admin', payload);
        if (res.data.success) {
          toast.success('Offer created successfully');
          setIsModalOpen(false);
          fetchOffers();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async (off) => {
    if (!window.confirm(`Delete coupon offer "${off.code}"?`)) return;
    try {
      const res = await api.delete(`/offers/admin/${off._id}`);
      if (res.data.success) {
        toast.success('Offer removed successfully');
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">Offers & Promo Deals</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure WhatsApp checkout coupons, percentages, and minimum order rules
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-500">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No discount offers configured yet.
          </div>
        ) : (
          offers.map((off) => (
            <div
              key={off._id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#12372A] bg-stone-100 border border-dashed border-[#D4AF37] px-2.5 py-1 rounded-lg">
                    {off.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      off.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {off.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-stone-900 text-base mt-2">{off.title}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1">{off.description}</p>

                <div className="pt-3 border-t border-stone-100 mt-3 space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <strong className="text-stone-900">
                      {off.discountType === 'percentage' ? `${off.discountValue}% OFF` : `₹${off.discountValue} FLAT`}
                    </strong>
                  </div>
                  {off.minOrderAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span>₹{off.minOrderAmount}</span>
                    </div>
                  )}
                  {off.maxDiscountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Max Cap:</span>
                      <span>₹{off.maxDiscountAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(off)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteOffer(off)}
                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#12372A]">
                {editingOffer ? 'Edit Promo Offer' : 'Create Promo Offer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Festival 15% Savings"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MEETHA15"
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="250"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Max Cap (₹, 0 for none)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="150"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 15% discount on WhatsApp orders above ₹250"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded-sm text-[#12372A]"
                />
                <span>Active and valid for checkout</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#12372A] hover:bg-[#1F4D3C] text-white rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
