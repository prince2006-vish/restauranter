import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Upload,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Globe,
} from "lucide-react";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);
    setUploadingLogo(true);
    try {
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, logo: res.data.url }));
        toast.success("Restaurant logo uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);
    setUploadingHero(true);
    try {
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, heroImage: res.data.url }));
        toast.success("Hero background image uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload hero image");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/settings/admin", formData);
      if (res.data.success) {
        toast.success("Restaurant settings saved! Customer site updated.");
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">
            Website & Restaurant Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Branding, WhatsApp contact numbers, delivery charges, hero copy, and
            operational rules
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {/* 1. Identity & Branding */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          1. Brand Identity & Logo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={formData.restaurantName || ""}
              onChange={(e) =>
                setFormData({ ...formData, restaurantName: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Brand Tagline
            </label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <label className="block text-xs font-semibold text-stone-700">
            Restaurant Logo
          </label>
          <div className="flex items-center gap-3">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-12 h-12 rounded-xl object-contain bg-white border border-stone-300 p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-xs">
                None
              </div>
            )}
            <input
              type="text"
              value={formData.logo || ""}
              onChange={(e) =>
                setFormData({ ...formData, logo: e.target.value })
              }
              placeholder="Paste logo URL or upload from disk..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
            />
            <label className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingLogo ? "..." : "Upload File"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* 2. Hero Section Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          2. Homepage Hero Showcase
        </h2>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Hero Title
          </label>
          <input
            type="text"
            value={formData.heroTitle || ""}
            onChange={(e) =>
              setFormData({ ...formData, heroTitle: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 font-serif font-bold text-stone-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Hero Subtitle
          </label>
          <textarea
            rows="2"
            value={formData.heroSubtitle || ""}
            onChange={(e) =>
              setFormData({ ...formData, heroSubtitle: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
          />
        </div>

        {/* Hero Background Image */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <label className="block text-xs font-semibold text-stone-700">
            Hero Background Photography
          </label>
          <div className="flex items-center gap-3">
            {formData.heroImage && (
              <img
                src={formData.heroImage}
                alt="Hero"
                className="w-16 h-10 rounded-lg object-cover border shrink-0"
              />
            )}
            <input
              type="text"
              value={formData.heroImage || ""}
              onChange={(e) =>
                setFormData({ ...formData, heroImage: e.target.value })
              }
              placeholder="Hero background URL or upload..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
            />
            <label className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingHero ? "..." : "Upload File"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. WhatsApp & Contact Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          3. WhatsApp Order Destination & Contact Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1">
              WhatsApp Order Phone * (With country code, no +)
            </label>
            <input
              type="text"
              required
              value={formData.whatsappPhone || ""}
              onChange={(e) =>
                setFormData({ ...formData, whatsappPhone: e.target.value })
              }
              placeholder="918853260723"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-[10px] text-stone-400 block mt-1">
              e.g. 918853260723 for India
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Calling Phone Number
            </label>
            <input
              type="text"
              value={formData.contactPhone || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contact@meethapani.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Restaurant Physical Address
            </label>
            <textarea
              rows="2"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={formData.openingHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, openingHours: e.target.value })
              }
              placeholder="Mon - Sun: 11:30 AM – 11:30 PM"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>
        </div>
      </div>

      {/* 4. Ordering Rules & Delivery Charges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          4. Delivery & Order Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Delivery Fee (₹)
            </label>
            <input
              type="number"
              min="0"
              value={
                formData.deliveryFee !== undefined ? formData.deliveryFee : 40
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deliveryFee: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Minimum Order Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              value={
                formData.minOrderAmount !== undefined
                  ? formData.minOrderAmount
                  : 200
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderAmount: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol || "₹"}
              onChange={(e) =>
                setFormData({ ...formData, currencySymbol: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={formData.deliveryEnabled !== false}
              onChange={(e) =>
                setFormData({ ...formData, deliveryEnabled: e.target.checked })
              }
              className="rounded-sm text-[#12372A]"
            />
            <span>Accept Home Delivery Orders</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={formData.takeawayEnabled !== false}
              onChange={(e) =>
                setFormData({ ...formData, takeawayEnabled: e.target.checked })
              }
              className="rounded-sm text-[#12372A]"
            />
            <span>Accept Counter Takeaway Orders</span>
          </label>
        </div>
      </div>

      {/* 5. Promotional Announcement Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          5. Top Announcement Banner
        </h2>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Banner Announcement Text
          </label>
          <input
            type="text"
            value={formData.announcementBanner?.text || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                announcementBanner: {
                  ...formData.announcementBanner,
                  text: e.target.value,
                },
              })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={formData.announcementBanner?.enabled !== false}
            onChange={(e) =>
              setFormData({
                ...formData,
                announcementBanner: {
                  ...formData.announcementBanner,
                  enabled: e.target.checked,
                },
              })
            }
            className="rounded-sm text-[#12372A]"
          />
          <span>Show banner at the top of every page</span>
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save All Changes"}</span>
        </button>
      </div>
    </form>
  );
};

export default AdminSettings;
