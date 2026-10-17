import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    restaurantName: "Meetha Pani",
    tagline: "Authentic Indian Flavors Steeped in Heritage",
    heroTitle: "Royal Indian Gastronomy, Handcrafted with Love",
    heroSubtitle:
      "From simmering handi curries and fragrant dum biryanis to melt-in-mouth desserts—taste authentic heritage prepared fresh daily.",
    heroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    contactPhone: "+91 98765 43210",
    whatsappPhone: "918853260723",
    email: "contact@meethapani.com",
    address: "42, Heritage Boulevard, Civil Lines, Jaipur, Rajasthan 302006",
    openingHours: "Mon - Sun: 11:30 AM – 11:30 PM",
    deliveryFee: 40,
    minOrderAmount: 200,
    deliveryEnabled: true,
    takeawayEnabled: true,
    currencySymbol: "₹",
    announcementBanner: {
      enabled: true,
      text: "🎉 Welcome to Meetha Pani! Enjoy Flat 15% OFF your first WhatsApp order with code MEETHA15",
    },
    socialLinks: {
      instagram: "https://instagram.com/meethapanirestaurant",
      facebook: "https://facebook.com/meethapanirestaurant",
      twitter: "",
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.warn("Using default settings fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refreshSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
