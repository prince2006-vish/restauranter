import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Image as ImageIcon,
} from "lucide-react";
import api from "../services/api";
import VegBadge from "../components/VegBadge";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    discountPrice: "",
    category: "",
    image: "",
    isVeg: true,
    availability: "available",
    isFeatured: false,
    prepTime: "15-20 mins",
    tags: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [saving, setSaving] = useState(false);

  const { settings } = useSettings();
  const currency = settings.currencySymbol || "₹";

  const fetchFoodsAndCategories = async () => {
    setLoading(true);
    try {
      const [foodsRes, catsRes] = await Promise.all([
        api.get("/foods/admin"),
        api.get("/categories/admin"),
      ]);
      if (foodsRes.data.success) setFoods(foodsRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
    } catch (err) {
      console.error("Error fetching foods/categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsAndCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      shortDescription: "",
      fullDescription: "",
      price: "",
      discountPrice: "",
      category: categories[0]?._id || "",
      image: "",
      isVeg: true,
      availability: "available",
      isFeatured: false,
      prepTime: "15-20 mins",
      tags: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      shortDescription: food.shortDescription,
      fullDescription: food.fullDescription || "",
      price: food.price.toString(),
      discountPrice: food.discountPrice ? food.discountPrice.toString() : "",
      category: food.category?._id || food.category,
      image: food.image,
      isVeg: food.isVeg,
      availability: food.availability,
      isFeatured: food.isFeatured,
      prepTime: food.prepTime || "15-20 mins",
      tags: Array.isArray(food.tags) ? food.tags.join(", ") : "",
    });
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    setUploadingImage(true);
    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        toast.success("Food image uploaded successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.shortDescription ||
      !formData.price ||
      !formData.category ||
      !formData.image
    ) {
      toast.error(
        "Please fill all required food fields including image and category",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : null,
      };

      if (editingFood) {
        const res = await api.put(`/foods/admin/${editingFood._id}`, payload);
        if (res.data.success) {
          toast.success("Food item updated successfully!");
          setIsModalOpen(false);
          fetchFoodsAndCategories();
        }
      } else {
        const res = await api.post("/foods/admin", payload);
        if (res.data.success) {
          toast.success("Food item created successfully!");
          setIsModalOpen(false);
          fetchFoodsAndCategories();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save food");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!deleteConfirmation) return;
    try {
      const res = await api.delete(`/foods/admin/${deleteConfirmation._id}`);
      if (res.data.success) {
        toast.success("Food item deleted successfully");
        setDeleteConfirmation(null);
        fetchFoodsAndCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete food");
    }
  };

  const handleQuickAvailabilityToggle = async (food, newStatus) => {
    try {
      const res = await api.patch(`/foods/admin/${food._id}/availability`, {
        availability: newStatus,
      });
      if (res.data.success) {
        toast.success(`${food.name} is now ${newStatus}`);
        setFoods((prev) =>
          prev.map((f) =>
            f._id === food._id ? { ...f, availability: newStatus } : f,
          ),
        );
      }
    } catch (err) {
      toast.error("Failed to change availability");
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchesSearch =
      searchQuery === "" ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      (f.category?._id || f.category) === categoryFilter;
    const matchesAvailability =
      availabilityFilter === "all" || f.availability === availabilityFilter;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#12372A]">
            Menu & Food Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Create, update, upload photography, and adjust inventory
            availability ({foods.length} dishes total)
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by dish name or keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
        >
          <option value="all">All Availability</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="temporarily_unavailable">
            Temporarily Unavailable
          </option>
        </select>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500">
          Loading dishes catalogue...
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-stone-200 text-center p-8 space-y-3">
          <p className="text-xs text-stone-500">
            No dishes match your search criteria.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#12372A] text-white text-xs font-bold rounded-xl"
          >
            Add Your First Dish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Image & Quick Badges */}
              <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <div className="bg-white/90 p-1 rounded-md shadow-xs">
                    <VegBadge isVeg={food.isVeg} />
                  </div>
                  {food.isFeatured && (
                    <span className="bg-[#12372A] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Flame className="w-3 h-3 text-[#D4AF37]" /> Featured
                    </span>
                  )}
                </div>

                {/* Quick Availability overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl text-white text-[11px]">
                  <span>Status:</span>
                  <select
                    value={food.availability}
                    onChange={(e) =>
                      handleQuickAvailabilityToggle(food, e.target.value)
                    }
                    className="bg-stone-900 text-white rounded-md px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="temporarily_unavailable">
                      Temp. Paused
                    </option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                      {food.name}
                    </h3>
                    <span className="font-bold text-sm text-[#12372A] shrink-0">
                      {currency}
                      {food.discountPrice || food.price}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {food.shortDescription}
                  </p>
                  <span className="text-[10px] font-semibold text-stone-400 block mt-2">
                    Category: {food.category?.name || "Uncategorized"}
                  </span>
                </div>

                {/* Card footer buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(food)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmation(food)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT FOOD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#12372A]">
                {editingFood
                  ? `Edit Dish: ${editingFood.name}`
                  : "Add New Food Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Paneer Tikka Angara"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="290"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discounted Price (₹, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value,
                      })
                    }
                    placeholder="260"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Food Type *
                  </label>
                  <div className="flex items-center gap-4 pt-1.5">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="vegType"
                        checked={formData.isVeg === true}
                        onChange={() =>
                          setFormData({ ...formData, isVeg: true })
                        }
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="vegType"
                        checked={formData.isVeg === false}
                        onChange={() =>
                          setFormData({ ...formData, isVeg: false })
                        }
                      />
                      <span>Non-Vegetarian</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="One sentence summary of the dish..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows="2"
                  value={formData.fullDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullDescription: e.target.value,
                    })
                  }
                  placeholder="Preparation style, marinades, heritage notes..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-semibold text-stone-700">
                  Food Photography Image *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-300 shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Paste image URL or upload from disk..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {uploadingImage
                          ? "Uploading image..."
                          : "Choose from computer"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Prep time & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) =>
                      setFormData({ ...formData, prepTime: e.target.value })
                    }
                    placeholder="15-20 mins"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="bestseller, tandoori, claypot"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Checkboxes: Featured & Availability */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded-sm text-[#12372A]"
                  />
                  <span>Mark as Chef's Pick / Featured on Homepage</span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-700">
                    Initial Availability:
                  </span>
                  <select
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                    className="px-2 py-1 text-xs rounded-lg border border-stone-300"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="temporarily_unavailable">
                      Temporarily Unavailable
                    </option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#12372A] hover:bg-[#1F4D3C] text-white rounded-xl shadow-xs"
                >
                  {saving
                    ? "Saving..."
                    : editingFood
                      ? "Save Changes"
                      : "Create Food Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Delete Food Item?
            </h3>
            <p className="text-xs text-stone-500">
              Are you sure you want to delete{" "}
              <strong>"{deleteConfirmation.name}"</strong>? This will remove it
              from the customer menu permanently.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFood}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
