import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-[#12372A]/10 text-[#12372A] flex items-center justify-center mx-auto">
        <Utensils className="w-10 h-10" />
      </div>
      <h1 className="font-serif text-4xl font-extrabold text-[#12372A]">404 - Page Not Found</h1>
      <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
        The royal feast you are looking for isn't here. Let's take you back to our delicious menu.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#12372A] text-[#D4AF37] font-bold text-xs shadow-md hover:bg-[#1F4D3C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
