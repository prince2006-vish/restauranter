import React from 'react';
import { Plus, Minus, Clock, Flame } from 'lucide-react';
import VegBadge from './VegBadge';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const FoodCard = ({ food }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { settings } = useSettings();
  const currency = settings.currencySymbol || '₹';

  const cartItem = cart.find((item) => item._id === food._id);
  const isAvailable = food.availability === 'available';
  const hasDiscount = food.discountPrice !== null && food.discountPrice < food.price;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Food Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !isAvailable ? 'grayscale opacity-60' : ''
          }`}
        />

        {/* Badges Top Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <div className="bg-white/90 backdrop-blur-md p-1 rounded-md shadow-xs">
            <VegBadge isVeg={food.isVeg} />
          </div>

          {food.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-[#12372A] text-[#D4AF37] text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              <Flame className="w-3 h-3 text-[#D4AF37]" /> Chef's Pick
            </span>
          )}

          {hasDiscount && isAvailable && (
            <span className="bg-[#D4AF37] text-[#12372A] text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              SAVE {currency}{food.price - food.discountPrice}
            </span>
          )}
        </div>

        {/* Prep Time bottom overlay */}
        {food.prepTime && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            <span>{food.prepTime}</span>
          </div>
        )}

        {/* Out of stock banner */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
              {food.availability === 'out_of_stock' ? 'Out of Stock' : 'Unavailable Today'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#12372A] transition-colors leading-snug">
              {food.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {food.shortDescription}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#12372A]">
                {currency}
                {hasDiscount ? food.discountPrice : food.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  {currency}
                  {food.price}
                </span>
              )}
            </div>
            {food.category?.name && (
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                {food.category.name}
              </span>
            )}
          </div>

          {/* Add to Cart / Quantity controls */}
          {isAvailable ? (
            cartItem ? (
              <div className="inline-flex items-center gap-2 bg-[#12372A] text-white rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => updateQuantity(food._id, cartItem.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold px-1 min-w-[16px] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food._id, cartItem.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food, 1)}
                className="inline-flex items-center gap-1.5 bg-[#12372A] hover:bg-[#1F4D3C] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Add</span>
              </button>
            )
          ) : (
            <button
              disabled
              className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
