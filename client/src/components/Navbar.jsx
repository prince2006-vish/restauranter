import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  PhoneCall,
  Shield,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { settings } = useSettings();
  const { cartCount } = useCart();
  const {
    customer,
    isCustomerAuthenticated,
    customerLogout,
    isAdminAuthenticated,
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "About Us", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
    { name: "Track Order", path: "/track-order" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#12372A]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.restaurantName}
                className="h-12 w-auto object-contain rounded-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#12372A] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-xl shadow-xs group-hover:scale-105 transition-transform">
                MP
              </div>
            )}
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#12372A] group-hover:text-[#1F4D3C] transition-colors">
                {settings.restaurantName || "Meetha Pani"}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold -mt-1">
                Authentic Indian
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors hover:text-[#12372A] relative py-1 ${
                    isActive
                      ? "text-[#12372A] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#D4AF37]"
                      : "text-stone-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions: Cart, Auth, Quick WhatsApp */}
          <div className="hidden md:flex items-center gap-4">
            {/* WhatsApp Quick Order button */}
            <a
              href={`https://wa.me/${settings.whatsappPhone || "918853260723"}?text=${encodeURIComponent("Hello Meetha Pani, I would like to order food.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Direct</span>
            </a>

            {/* Cart Icon with count */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-[#12372A] hover:bg-[#12372A]/5 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#12372A] font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Customer Authentication */}
            {isCustomerAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/my-orders"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#12372A]" />
                  <span className="max-w-[90px] truncate">
                    {customer.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={customerLogout}
                  title="Logout"
                  className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-700 hover:text-[#12372A] px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-[#12372A] hover:bg-[#1F4D3C] text-white px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Admin Portal Shortcut */}
            <Link
              to={isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"}
              title="Admin Portal"
              className="p-2 text-stone-400 flex gap-0.5 hover:text-[#12372A] hover:bg-stone-100 rounded-lg transition-colors border-stone-200 border-b-2 bg-gray-50"
            >
              <Shield className="w-6 h-6" /> Admin Panel
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              to="/cart"
              className="relative p-2 text-[#12372A]"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#12372A] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-[#12372A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-[#12372A]/10 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-stone-700 hover:text-[#12372A] py-2 px-3 rounded-md hover:bg-stone-100"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-stone-700 hover:text-[#12372A] py-2 px-3 rounded-md hover:bg-stone-100"
            >
              My Orders
            </Link>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            {isCustomerAuthenticated ? (
              <div className="flex items-center justify-between px-3 py-2 bg-stone-100 rounded-lg">
                <span className="text-sm font-medium text-stone-800">
                  Hi, {customer.name}
                </span>
                <button
                  onClick={() => {
                    customerLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold border border-stone-300 rounded-lg text-stone-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold bg-[#12372A] text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs text-stone-500 px-3">
              <Link
                to={isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:underline flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </Link>
              <a
                href={`tel:${settings.contactPhone || "+918853260723"}`}
                className="text-emerald-700 font-semibold"
              >
                {settings.contactPhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
