import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Tag,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import FoodCard from "../components/FoodCard";
import toast from "react-hot-toast";

const HomePage = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    rating: 5,
    dishMentioned: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catsRes, foodsRes, offersRes, reviewsRes, galleryRes] =
          await Promise.all([
            api.get("/categories"),
            api.get("/foods?isFeatured=true&limit=8"),
            api.get("/offers"),
            api.get("/reviews"),
            api.get("/gallery?limit=6"),
          ]);

        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (foodsRes.data.success) setFeaturedFoods(foodsRes.data.data);
        if (offersRes.data.success) setOffers(offersRes.data.data);
        if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
        if (galleryRes.data.success) setGallery(galleryRes.data.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(""), 3000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.comment) {
      toast.error("Please enter your name and feedback");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", reviewForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowReviewModal(false);
        setReviewForm({
          customerName: "",
          rating: 5,
          dishMentioned: "",
          comment: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              settings.heroImage ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            }
            alt="Meetha Pani Ambience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/75 to-stone-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {settings.tagline || "Flavors Steeped in Heritage & Love"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto drop-shadow-md">
            {settings.heroTitle ||
              "Royal Indian Gastronomy, Handcrafted with Love"}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed drop-shadow-xs font-light">
            {settings.heroSubtitle ||
              "From simmering handi curries and fragrant dum biryanis to melt-in-mouth desserts—taste authentic heritage prepared fresh daily."}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89628] text-[#12372A] font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-102"
            >
              <span>
                {settings.heroButtonSecondary || "Explore Royal Menu"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${settings.whatsappPhone || "918853260723"}?text=${encodeURIComponent("Hello Meetha Pani, I would like to order food.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#12372A]/90 hover:bg-[#12372A] text-white font-semibold text-sm border border-[#D4AF37]/40 backdrop-blur-sm transition-all hover:scale-102"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{settings.heroButtonPrimary || "Order on WhatsApp"}</span>
            </a>
          </div>

          {/* Feature highlights badge bar */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90 text-xs">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Desi Ghee & Fresh Spices</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Cooked Fresh to Order</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              <span>Instant WhatsApp Confirmation</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span>Live Order Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
            Curated Culinary Heritage
          </p>
          <h2 className="font-serif text-3xl font-bold text-[#12372A] mt-1">
            Browse by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/menu?category=${cat._id}`}
              className="group bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#D4AF37] transition-all text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-stone-100 border-2 border-stone-100 group-hover:border-[#D4AF37] transition-colors">
                <img
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#12372A] transition-colors leading-tight">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED DISHES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Chef's Masterpieces</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#12372A]">
              Featured Delicacies
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#12372A] hover:text-[#1F4D3C] transition-colors self-start md:self-auto"
          >
            <span>View Complete Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 4. OFFERS & SPECIAL PROMOTIONS */}
      {offers.length > 0 && (
        <section className="bg-[#12372A]/5 py-14 border-y border-[#12372A]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Treats</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#12372A] mt-1">
                Exclusive Deals & Promo Codes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-2xl p-6 border border-[#D4AF37]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <span className="inline-block bg-[#12372A] text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {offer.discountType === "percentage"
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} FLAT OFF`}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-md">
                      {offer.description}
                      {offer.minOrderAmount > 0 &&
                        ` (Min order: ₹${offer.minOrderAmount})`}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 bg-[#FDFBF7] p-2 rounded-xl border border-dashed border-[#D4AF37]">
                    <span className="font-mono text-sm font-bold text-[#12372A] px-2">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="p-1.5 rounded-lg bg-[#12372A] text-[#D4AF37] hover:bg-[#1F4D3C] transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. ABOUT THE RESTAURANT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80"
              alt="Live Kitchen"
              className="rounded-2xl object-cover h-64 sm:h-80 w-full shadow-md"
            />
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80"
              alt="Dining Experience"
              className="rounded-2xl object-cover h-64 sm:h-80 w-full mt-6 shadow-md"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Royal Legacy & Craft
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#12372A] mt-1">
                {settings.aboutTitle || "The Story of Meetha Pani"}
              </h2>
            </div>

            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              {settings.aboutText ||
                "Founded with a deep devotion to royal kitchen traditions, Meetha Pani brings authentic spices, slow-cooked curries, charcoal-grilled tandoori classics, and comforting desserts to your table."}
            </p>

            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              {settings.aboutStory ||
                "Every recipe at Meetha Pani tells a story—passed down through generations and perfected by our master chefs. We believe great food begins with purity of ingredients and warmth of service."}
            </p>

            <div className="pt-2 flex flex-wrap gap-6 text-sm text-stone-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-medium">{settings.openingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-medium truncate max-w-xs">
                  {settings.address}
                </span>
              </div>
            </div>

            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-white text-xs font-semibold tracking-wide transition-colors"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RESTAURANT GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Visual Splendor
              </p>
              <h2 className="font-serif text-3xl font-bold text-[#12372A] mt-1">
                Moments at Meetha Pani
              </h2>
            </div>
            <Link
              to="/gallery"
              className="text-sm font-semibold text-[#12372A] hover:underline hidden sm:block"
            >
              View All Photos
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.slice(0, 6).map((img) => (
              <div
                key={img._id}
                className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100 shadow-xs"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <h4 className="font-serif text-sm font-bold">{img.title}</h4>
                  {img.caption && (
                    <p className="text-xs text-stone-300 mt-0.5">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CUSTOMER REVIEWS */}
      <section className="bg-[#12372A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Guest Impressions
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                Words from Our Patrons
              </h2>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89628] text-[#12372A] font-bold text-xs tracking-wide transition-all shadow-md self-start sm:self-auto"
            >
              <Star className="w-4 h-4" />
              <span>Share Your Feedback</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-200 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {rev.customerName}
                  </span>
                  {rev.dishMentioned && (
                    <span className="text-[#D4AF37] font-medium">
                      {rev.dishMentioned}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONTACT & LOCATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Find Us
              </p>
              <h2 className="font-serif text-3xl font-bold text-[#12372A]">
                Visit Meetha Pani
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Step into our dining room or order directly to your home. We
                look forward to welcoming you with royal hospitality.
              </p>
            </div>

            <div className="space-y-4 text-sm text-stone-800">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#12372A]">
                    Address
                  </span>
                  <span className="text-stone-600">{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#12372A]">
                    Direct Phone
                  </span>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="text-stone-600 hover:underline"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#12372A]">
                    Service Hours
                  </span>
                  <span className="text-stone-600">
                    {settings.openingHours}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-100">
              <a
                href={settings.googleMapsDirectionsUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#12372A]" />
                <span>Get Directions</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsappPhone || "918853260723"}?text=${encodeURIComponent("Hello Meetha Pani, I would like to reserve a table or order food.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Contact</span>
              </a>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs min-h-[360px] bg-stone-100">
            <iframe
              title="Meetha Pani Location"
              src={settings.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "360px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-serif text-2xl font-bold text-[#12372A]">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-stone-400 hover:text-stone-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={reviewForm.customerName}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="e.g. Vikramaditya Singh"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating
                            ? "text-[#D4AF37] fill-[#D4AF37]"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-stone-500 font-medium ml-2">
                    {reviewForm.rating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Favorite Dish Mentioned (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.dishMentioned}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      dishMentioned: e.target.value,
                    })
                  }
                  placeholder="e.g. Dal Meetha Pani, Dahi Ke Kebab"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Experience / Review *
                </label>
                <textarea
                  rows="3"
                  required
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Tell us what you loved about our food, speed, or packaging..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#12372A] hover:bg-[#1F4D3C] text-white shadow-xs"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
