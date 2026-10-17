import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Shield, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { admin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: admin?.fullName || '',
    email: admin?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (admin) {
      setFormData((prev) => ({
        ...prev,
        fullName: admin.fullName || '',
        email: admin.email || '',
      }));
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.put('/auth/admin/profile', payload);
      if (res.data.success) {
        toast.success('Admin profile credentials updated successfully');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#12372A]">Administrator Account & Security</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage master administrator profile and change login security credentials
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
          <div className="w-14 h-14 rounded-2xl bg-[#12372A] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-xs">
            {admin?.fullName ? admin.fullName.charAt(0) : 'A'}
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">{admin?.fullName}</h3>
            <span className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider block">
              Role: {admin?.role} • Username: {admin?.username}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          <div className="pt-3 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Change Password (Leave blank to keep current)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>{saving ? 'Updating...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
