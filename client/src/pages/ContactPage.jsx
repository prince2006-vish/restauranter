import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const ContactPage = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#12372A]">
          Contact & Location
        </h1>
        <p className="text-stone-600 text-sm">
          Have an inquiry, wish to reserve a table, or need quick assistance
          with an order? We are here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#12372A]">
              Restaurant Information
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold">
                    Address
                  </strong>
                  <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold">
                    Phone
                  </strong>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="text-stone-600 hover:underline text-xs sm:text-sm"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold">
                    Email
                  </strong>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-stone-600 hover:underline text-xs sm:text-sm"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold">
                    Opening Hours
                  </strong>
                  <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                    {settings.openingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action Box */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <h3 className="font-serif text-xl font-bold">
              Fast WhatsApp Response
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Our front desk manager is active on WhatsApp during all restaurant
              hours. Message us for bulk catering, birthdays, or special food
              preparations.
            </p>
            <a
              href={`https://wa.me/${settings.whatsappPhone || "918853260723"}?text=${encodeURIComponent("Hello Meetha Pani, I would like to contact your team.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs tracking-wide hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Map Embed */}
        <div className="rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs min-h-[420px] bg-stone-100">
          <iframe
            title="Restaurant Location"
            src={settings.googleMapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "420px" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
