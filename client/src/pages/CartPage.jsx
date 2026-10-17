import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import VegBadge from '../components/VegBadge';

const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    couponCode,
    discountAmount,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [inputCoupon, setInputCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const currency = settings.currencySymbol || '₹';
  const minOrder = settings.minOrderAmount || 0;
  const deliveryFee = settings.deliveryFee || 0;
  const isBelowMin = subtotal < minOrder;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(inputCoupon);
    setApplyingCoupon(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-[#12372A]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#12372A]">Your Cart is Empty</h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            You haven't added any of our royal dishes yet. Explore our handcrafted menu to treat yourself and your family.
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] font-bold text-sm transition-all shadow-md"
        >
          <span>Explore Delicious Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#12372A]">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-1">Review your selected dishes before WhatsApp checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List (Left Column) */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const unitPrice =
              item.discountPrice !== null && item.discountPrice < item.price
                ? item.discountPrice
                : item.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Item Details */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <VegBadge isVeg={item.isVeg} />
                      <h3 className="font-serif font-bold text-stone-900 text-base">{item.name}</h3>
                    </div>
                    <p className="text-xs text-stone-500">
                      {currency}
                      {unitPrice} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  {/* Quantity Controls */}
                  <div className="inline-flex items-center gap-2 bg-stone-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 transition-colors shadow-2xs"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-1 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 transition-colors shadow-2xs"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total item amount */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-bold text-base text-[#12372A]">
                      {currency}
                      {itemTotal}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#12372A] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add more dishes from the menu</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon (Right Column) */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
              <Tag className="w-4 h-4 text-[#D4AF37]" />
              <span>Apply Discount Coupon</span>
            </div>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-800">{couponCode}</span>
                  <p className="text-[11px] text-emerald-700">Coupon applied successfully (-{currency}{discountAmount})</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. MEETHA15)"
                  className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="px-4 py-2 bg-[#12372A] hover:bg-[#1F4D3C] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-xs text-rose-600">{couponError}</p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-lg pb-3 border-b border-stone-100">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-medium text-stone-800">{currency}{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{currency}{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Estimated Delivery Fee</span>
                <span className="font-medium text-stone-800">
                  {settings.deliveryFee ? `${currency}${settings.deliveryFee}` : 'Free'}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-stone-900 text-base">To Pay</span>
                  <p className="text-[11px] text-stone-400">Inclusive of all restaurant taxes</p>
                </div>
                <span className="font-serif font-bold text-2xl text-[#12372A]">
                  {currency}{finalTotal}
                </span>
              </div>
            </div>

            {/* Minimum order check notification */}
            {isBelowMin && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Minimum order amount is {currency}{minOrder}. Please add dishes worth {currency}{minOrder - subtotal} more to proceed.
                </span>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              disabled={isBelowMin}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isBelowMin
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-[#12372A] hover:bg-[#1F4D3C] text-[#D4AF37] hover:shadow-lg hover:scale-101 active:scale-98'
              }`}
            >
              <span>Proceed to WhatsApp Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
