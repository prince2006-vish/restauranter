import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import api from '../services/api';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const categories = [
    { key: 'all', label: 'All Photos' },
    { key: 'food', label: 'Dishes & Sweets' },
    { key: 'interior', label: 'Dining Hall' },
    { key: 'kitchen', label: 'Live Kitchen' },
    { key: 'exterior', label: 'Courtyard & Ambiance' },
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'all' ? '/gallery' : `/gallery?category=${selectedCategory}`;
        const res = await api.get(url);
        if (res.data.success) {
          setImages(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
          Visual Tour
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#12372A]">
          Meetha Pani Gallery
        </h1>
        <p className="text-stone-600 text-sm">
          A glimpse into our royal dining halls, handcrafted culinary creations, and joyful guest moments.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? 'bg-[#12372A] text-[#D4AF37] shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-[#D4AF37]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-4/3 rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <Camera className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-500">No photos found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              onClick={() => setActiveModalImage(img)}
              className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100 shadow-xs cursor-pointer border border-stone-200/80"
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider capitalize">
                  {img.category}
                </span>
                <h4 className="font-serif text-sm font-bold mt-0.5">{img.title}</h4>
                {img.caption && <p className="text-xs text-stone-300 mt-0.5">{img.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeModalImage.imageUrl}
              alt={activeModalImage.title}
              className="w-full max-h-[75vh] object-contain"
            />
            <div className="p-4 bg-stone-950 text-white flex justify-between items-center">
              <div>
                <h4 className="font-serif text-base font-bold">{activeModalImage.title}</h4>
                {activeModalImage.caption && (
                  <p className="text-xs text-stone-400 mt-0.5">{activeModalImage.caption}</p>
                )}
              </div>
              <span className="text-xs text-[#D4AF37] uppercase font-mono font-bold">
                {activeModalImage.category}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
