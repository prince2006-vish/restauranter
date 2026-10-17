import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Persist cart
  useEffect(() => {
    localStorage.setItem('mp_cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.discountPrice !== null && item.discountPrice < item.price ? item.discountPrice : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  // Add to cart
  const addToCart = (food, quantity = 1) => {
    if (food.availability && food.availability !== 'available') {
      toast.error(`${food.name} is currently out of stock`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item._id === food._id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        toast.success(`Updated ${food.name} quantity in cart!`);
        return updated;
      } else {
        const effectivePrice = food.discountPrice !== null && food.discountPrice < food.price ? food.discountPrice : food.price;
        toast.success(`Added ${food.name} to cart!`);
        return [
          ...prevCart,
          {
            _id: food._id,
            name: food.name,
            price: food.price,
            discountPrice: food.discountPrice,
            effectivePrice,
            image: food.image,
            isVeg: food.isVeg,
            quantity,
          },
        ];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item._id === foodId ? { ...item, quantity } : item))
    );
  };

  // Remove from cart
  const removeFromCart = (foodId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== foodId));
    toast.success('Item removed from cart');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError('');
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }
    try {
      setCouponError('');
      const res = await api.post('/offers/validate', {
        code: code.trim(),
        subtotal,
      });

      if (res.data.success) {
        setCouponCode(res.data.code);
        setDiscountAmount(res.data.discount);
        toast.success(res.data.message);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
      toast.error(msg);
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError('');
    toast.success('Coupon removed');
  };

  // Cart item count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        cartCount,
        couponCode,
        discountAmount,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
