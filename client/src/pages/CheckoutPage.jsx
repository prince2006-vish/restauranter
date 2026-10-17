import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MapPin, Phone, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, subtotal, couponCode, discountAmount, clearCart } = useCart();
  const { settings } = useSettings();
  const { customer, isCustomerAuthenticated } = useAuth();
  const navigate = useNavigate();

  const currency = settings.currencySymbol || '₹';
  const deliveryFee = settings.deliveryFee || 0;

  // Checkout form state
  const [formData, setFormData] = useState({
    customerName: customer?.name || '',
    customerPhone: customer?.phone || '',
    customerWhatsapp: customer?.phone || '',
    orderType: 'delivery',
    deliveryAddress: customer?.address?.street || '',
    landmark: customer?.address?.landmark || '',
    customerInstructions: '',
  });

  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Sync whatsapp number if checkbox is checked
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customerPhone: val,
      customerWhatsapp: sameAsMobile ? val : prev.customerWhatsapp,
    }));
  };

  const handleSameAsMobileToggle = (checked) => {
    setSameAsMobile(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, customerWhatsapp: prev.customerPhone }));
    }
  };

  const effectiveDeliveryFee = formData.orderType === 'delivery' ? deliveryFee : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + effectiveDeliveryFee);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error('Please enter your mobile phone number');
      return;
    }
    if (!formData.customerWhatsapp.trim()) {
      toast.error('Please enter your WhatsApp contact number');
      return;
    }
    if (formData.orderType === 'delivery' && !formData.deliveryAddress.trim()) {
      toast.error('Please enter your complete delivery address');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerWhatsapp: formData.customerWhatsapp.trim(),
        orderType: formData.orderType,
        deliveryAddress: formData.orderType === 'delivery' ? formData.deliveryAddress.trim() : '',
        landmark: formData.orderType === 'delivery' ? formData.landmark.trim() : '',
        customerInstructions: formData.customerInstructions.trim(),
        couponCode: couponCode || '',
        items: cart.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/orders/checkout', payload);

      if (res.data.success) {
        toast.success('Order recorded in restaurant kitchen!');
        // Clear customer cart
        clearCart();

        // Redirect to Order Success page with state
        navigate(`/order-success/${res.data.order.orderNumber}`, {
          state: {
            order: res.data.order,
            whatsappUrl: res.data.whatsappUrl,
            whatsappMessage: res.data.whatsappMessage,
            restaurantWhatsappNumber: res.data.restaurantWhatsappNumber,
          },
        });
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-[#12372A]">
          Direct WhatsApp Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          No online payment gateway needed. Enter delivery details, and our system will generate your instant order ticket.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Form (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          {/* Order Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Order Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, orderType: 'delivery' })}
                className={`py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                  formData.orderType === 'delivery'
                    ? 'border-[#12372A] bg-[#12372A] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Doorstep Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, orderType: 'takeaway' })}
                className={`py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                  formData.orderType === 'takeaway'
                    ? 'border-[#12372A] bg-[#12372A] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Counter Takeaway</span>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="font-serif text-lg font-bold text-stone-900">Contact Information</h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Rameshwar Rathore"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Calling Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  disabled={sameAsMobile}
                  value={formData.customerWhatsapp}
                  onChange={(e) => setFormData({ ...formData, customerWhatsapp: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 disabled:bg-stone-50 disabled:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={sameAsMobile}
                onChange={(e) => handleSameAsMobileToggle(e.target.checked)}
                className="rounded-sm text-[#12372A] focus:ring-[#12372A]"
              />
              <span>WhatsApp number is the same as mobile number</span>
            </label>
          </div>

          {/* Delivery Address (only if delivery) */}
          {formData.orderType === 'delivery' && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">Delivery Address</h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Street Address *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="House/Flat number, Building name, Street name, Colony/Area..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near Heritage Gate, Opp. SBI Bank"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="pt-4 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Cooking / Delivery Instructions (Optional)
            </label>
            <input
              type="text"
              value={formData.customerInstructions}
              onChange={(e) => setFormData({ ...formData, customerInstructions: e.target.value })}
              placeholder="e.g. Make biryani less spicy, don't ring the doorbell, extra mint chutney..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            />
          </div>
        </div>

        {/* Order Summary & Submit (Right col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-lg pb-3 border-b border-stone-100">
              Order Summary ({cart.length} items)
            </h3>

            {/* Quick Items list preview */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemPrice =
                  item.discountPrice !== null && item.discountPrice < item.price
                    ? item.discountPrice
                    : item.price;
                return (
                  <div key={item._id} className="flex justify-between text-xs py-1">
                    <span className="text-stone-700 font-medium">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-stone-900 font-bold">
                      {currency}{itemPrice * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">{currency}{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-semibold">-{currency}{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-stone-800">
                  {effectiveDeliveryFee > 0 ? `${currency}${effectiveDeliveryFee}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100 text-base font-bold text-[#12372A]">
                <span>Total Amount</span>
                <span className="font-serif text-xl">{currency}{grandTotal}</span>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-emerald-900 text-[11px] leading-relaxed">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Clicking the button will save your order in the restaurant system and generate a prefilled WhatsApp message to confirm instantly.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{submitting ? 'Generating Order Ticket...' : 'Confirm & Open WhatsApp'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
