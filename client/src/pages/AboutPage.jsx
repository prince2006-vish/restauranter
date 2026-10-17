import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

const AboutPage = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-16 py-12">
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
          Our Heritage & Culinary Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#12372A]">
          {settings.aboutTitle || 'The Story of Meetha Pani'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {settings.aboutText ||
            'Founded with a deep devotion to royal kitchen traditions, Meetha Pani brings authentic spices, slow-cooked curries, charcoal-grilled tandoori classics, and comforting desserts to your table.'}
        </p>
      </div>

      {/* Visual Image Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl overflow-hidden h-72 sm:h-96 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              alt="Dining Room"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden h-72 sm:h-96 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
              alt="Tandoori Preparation"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden h-72 sm:h-96 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
              alt="Evening Courtyard"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Philosophy Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-stone-700 leading-relaxed text-sm sm:text-base bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs">
        <h2 className="font-serif text-2xl font-bold text-[#12372A]">
          Our Pillars of Excellence
        </h2>
        <p>
          At Meetha Pani, our name symbolizes the sweetness of pure water that sustains life and hospitality. In ancient Indian travel culture, welcoming a weary guest with 'Meetha Pani' (sweet sherbet or pure cool water) was the highest hallmark of respect. We carry that timeless tradition into every dish we serve.
        </p>
        <p>
          {settings.aboutStory ||
            'Every recipe at Meetha Pani tells a story—passed down through generations and perfected by our master chefs. We believe great food begins with purity of ingredients and warmth of service.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">Purity of Desi Ghee</h4>
              <p className="text-xs text-stone-500 mt-1">We cook our dals and handis exclusively in authentic churned desi ghee, without synthetic additives.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">In-House Spices</h4>
              <p className="text-xs text-stone-500 mt-1">Whole spices are slow-roasted in iron kadhais and ground by hand each morning for authentic aroma.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
