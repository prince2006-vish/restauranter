import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    category: 'food',
    caption: '',
    order: 0,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery/admin');
      if (res.data.success) {
        setImages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAddModal = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      imageUrl: '',
      category: 'food',
      caption: '',
      order: images.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (img) => {
    setEditingImage(img);
    setFormData({
      title: img.title,
      imageUrl: img.imageUrl,
      category: img.category || 'food',
      caption: img.caption || '',
      order: img.order || 0,
      isActive: img.isActive !== undefined ? img.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
        toast.success('Image uploaded successfully!');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveImage = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and Image URL are required');
      return;
    }

    setSaving(true);
    try {
      if (editingImage) {
        const res = await api.put(`/gallery/admin/${editingImage._id}`, formData);
        if (res.data.success) {
          toast.success('Gallery photo updated');
          setIsModalOpen(false);
          fetchGallery();
        }
      } else {
        const res = await api.post('/gallery/admin', formData);
        if (res.data.success) {
          toast.success('Gallery photo added');
          setIsModalOpen(false);
          fetchGallery();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (img) => {
    if (!window.confirm(`Delete photo "${img.title}"?`)) return;
    try {
      const res = await api.delete(`/gallery/admin/${img._id}`);
      if (res.data.success) {
        toast.success('Photo removed');
        fetchGallery();
      }
    } catch (err) {
      toast.error('Failed to remove photo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">Gallery Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload and arrange food photography, interior seating, and event photos
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-500">Loading gallery...</div>
        ) : images.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No gallery photos uploaded yet.
          </div>
        ) : (
          images.map((img) => (
            <div
              key={img._id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 bg-stone-100">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {img.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-serif font-bold text-stone-900 text-sm">{img.title}</h4>
                {img.caption && <p className="text-xs text-stone-500 line-clamp-2">{img.caption}</p>}
                <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                  <span>Order: #{img.order}</span>
                  <span className={img.isActive ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                    {img.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(img)}
                  className="px-3 py-1 bg-white hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-stone-200"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteImage(img)}
                  className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#12372A]">
                {editingImage ? 'Edit Photo' : 'Upload Gallery Photo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Royal Courtyard Seating"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                >
                  <option value="food">Dishes & Food</option>
                  <option value="interior">Dining Room / Interior</option>
                  <option value="kitchen">Live Kitchen</option>
                  <option value="exterior">Exterior & Courtyard</option>
                  <option value="events">Special Events</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Caption / Subtitle</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g. Handcrafted wooden architecture and warm ambiance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              {/* Upload image */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-xs font-semibold text-stone-700">Image Source *</label>
                <div className="flex gap-2 items-center">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="URL or select file..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                  <label className="p-2 bg-stone-200 rounded-lg cursor-pointer text-stone-700 hover:bg-stone-300">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded-sm text-[#12372A]"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

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
                  disabled={saving || uploading}
                  className="px-5 py-2 text-xs font-bold bg-[#12372A] hover:bg-[#1F4D3C] text-white rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
