import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import VegBadge from '../components/VegBadge';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_asc', 'price_desc', 'name_asc'

  // Fetch Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch Foods dynamically with filters
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        if (vegFilter === 'veg') {
          params.append('isVeg', 'true');
        } else if (vegFilter === 'nonveg') {
          params.append('isVeg', 'false');
        }
        if (availableOnly) {
          params.append('availableOnly', 'true');
        }
        if (sortBy) {
          params.append('sort', sortBy);
        }

        const res = await api.get(`/foods?${params.toString()}`);
        if (res.data.success) {
          setFoods(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching foods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [selectedCategory, searchQuery, vegFilter, availableOnly, sortBy]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setVegFilter('all');
    setAvailableOnly(false);
    setSortBy('popular');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#12372A]">
          Our Royal Menu
        </h1>
        <p className="text-stone-600 text-sm">
          Freshly prepared handi curries, smoky charcoal tandoori items, aromatic saffron biryanis, and decadent Indian sweets.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Paneer Tikka, Biryani, Naan)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>

          {/* Veg / Non-Veg Toggle Buttons */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-full md:w-auto shrink-0">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex-1 md:flex-initial ${
                vegFilter === 'all' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-1 md:flex-initial ${
                vegFilter === 'veg' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <VegBadge isVeg={true} size="sm" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setVegFilter('nonveg')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-1 md:flex-initial ${
                vegFilter === 'nonveg' ? 'bg-white shadow-xs text-rose-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <VegBadge isVeg={false} size="sm" />
              <span>Non-Veg</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Sub-filters row: Available only toggle & Reset */}
        <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded-sm text-[#12372A] focus:ring-[#12372A]"
            />
            <span className="font-medium">Show available dishes only</span>
          </label>

          {(selectedCategory !== 'all' || searchQuery || vegFilter !== 'all' || availableOnly || sortBy !== 'popular') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#12372A] hover:underline font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#12372A] text-[#D4AF37] shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:border-[#D4AF37]'
          }`}
        >
          All Items ({foods.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat._id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat._id
                ? 'bg-[#12372A] text-[#D4AF37] shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-[#D4AF37]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-800">No dishes match your selection</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing your filters, or browsing our full category catalogue.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2 rounded-xl bg-[#12372A] text-white text-xs font-bold"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
