import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnnouncementBanner from '../components/AnnouncementBanner';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
