import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Sparkles } from 'lucide-react';

const AnnouncementBanner = () => {
  const { settings } = useSettings();

  if (!settings?.announcementBanner?.enabled || !settings?.announcementBanner?.text) {
    return null;
  }

  return (
    <div className="bg-[#12372A] text-[#FDFBF7] text-xs sm:text-sm font-medium py-2 px-4 text-center border-b border-[#D4AF37]/30 flex items-center justify-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
      <span>{settings.announcementBanner.text}</span>
    </div>
  );
};

export default AnnouncementBanner;
