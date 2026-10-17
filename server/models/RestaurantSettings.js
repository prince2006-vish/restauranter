import mongoose from "mongoose";

const restaurantSettingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: "Meetha Pani",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Flavors Steeped in Heritage & Love",
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },
    heroTitle: {
      type: String,
      default: "Authentic Indian Delicacies Crafted with Passion",
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default:
        "Experience the rich culinary heritage of India at Meetha Pani. Fresh ingredients, time-honored recipes, and warm hospitality delivered right to your doorstep.",
      trim: true,
    },
    heroImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    },
    heroButtonPrimary: {
      type: String,
      default: "Order via WhatsApp",
    },
    heroButtonSecondary: {
      type: String,
      default: "Explore Menu",
    },
    aboutTitle: {
      type: String,
      default: "The Story of Meetha Pani",
    },
    aboutText: {
      type: String,
      default:
        "Founded with a deep devotion to royal kitchen traditions, Meetha Pani brings authentic spices, slow-cooked curries, charcoal-grilled tandoori classics, and comforting desserts to your table.",
    },
    aboutStory: {
      type: String,
      default:
        "Every recipe at Meetha Pani tells a story—passed down through generations and perfected by our master chefs. We believe great food begins with purity of ingredients and warmth of service.",
    },
    aboutImages: [
      {
        type: String,
      },
    ],
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    whatsappPhone: {
      type: String,
      default: "918853260723",
    },
    email: {
      type: String,
      default: "hello@meethapani.com",
    },
    address: {
      type: String,
      default:
        "Plot 42, Royal Heritage Lane, Civil Lines, Jaipur, Rajasthan 302006",
    },
    googleMapsEmbedUrl: {
      type: String,
      default:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113886.97446554862!2d75.72051786938927!3d26.912433649432684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db479f9b1c72b%3A0xe3fbd62c34be4070!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    },
    googleMapsDirectionsUrl: {
      type: String,
      default: "https://maps.google.com/?q=Meetha+Pani+Restaurant+Jaipur",
    },
    openingHours: {
      type: String,
      default: "Monday - Sunday: 11:00 AM – 11:30 PM",
    },
    socialLinks: {
      instagram: {
        type: String,
        default: "https://instagram.com/meethapanirestaurant",
      },
      facebook: {
        type: String,
        default: "https://facebook.com/meethapanirestaurant",
      },
      twitter: { type: String, default: "https://twitter.com/meethapani" },
      youtube: { type: String, default: "" },
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    minOrderAmount: {
      type: Number,
      default: 200,
    },
    deliveryEnabled: {
      type: Boolean,
      default: true,
    },
    takeawayEnabled: {
      type: Boolean,
      default: true,
    },
    currencySymbol: {
      type: String,
      default: "₹",
    },
    announcementBanner: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default:
          "🎉 Special Offer: Flat 15% OFF on first WhatsApp order with code MEETHA15!",
      },
    },
    seoTitle: {
      type: String,
      default: "Meetha Pani | Authentic Fine Dining & Quick WhatsApp Ordering",
    },
    seoDescription: {
      type: String,
      default:
        "Savor royal Indian curries, tandoori platters, fragrant biryanis, and traditional desserts at Meetha Pani. Order directly on WhatsApp with live status updates.",
    },
  },
  { timestamps: true },
);

export default mongoose.model("RestaurantSettings", restaurantSettingsSchema);
