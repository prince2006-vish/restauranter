import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Percent,
  Image as ImageIcon,
  Star,
  Users,
  Settings,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { admin, isAdminAuthenticated, adminLogout } = useAuth();
  const { socket } = useSocket();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlerts, setNewOrderAlerts] = useState(0);

  // Protect Admin route
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  // Audio notification synthesized with Web Audio API (cross-browser, zero external mp3 needed!)
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio not allowed yet
    }
  };

  // Socket.IO real-time notification listener for incoming orders
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_admin_room');

    const handleNewOrder = (data) => {
      setNewOrderAlerts((prev) => prev + 1);
      playNotificationChime();
      toast.success(
        `🚨 New Order Received! #${data.orderNumber} by ${data.customerName} (₹${data.totalAmount})`,
        {
          duration: 6000,
          icon: '🛎️',
        }
      );
    };

    socket.on('new_order_placed', handleNewOrder);

    return () => {
      socket.off('new_order_placed', handleNewOrder);
    };
  }, [socket, soundEnabled]);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingBag, badge: newOrderAlerts },
    { name: 'Menu & Foods', path: '/admin/foods', icon: UtensilsCrossed },
    { name: 'Food Categories', path: '/admin/categories', icon: Tags },
    { name: 'Offers & Deals', path: '/admin/offers', icon: Percent },
    { name: 'Gallery Photos', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Website Settings', path: '/admin/website-settings', icon: Settings },
    { name: 'Admin Profile', path: '/admin/profile', icon: UserCheck },
  ];

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex text-stone-900 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#12372A] text-white shrink-0 border-r border-[#D4AF37]/20 shadow-xl">
        {/* Brand Banner */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#12372A] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
            MP
          </div>
          <div className="truncate">
            <span className="font-serif font-bold text-base text-white block truncate">
              {settings.restaurantName || 'Meetha Pani'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
              Admin Control Panel
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#12372A] shadow-md font-bold'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-2 bg-white/5 rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase">Logged in as</span>
            <span className="text-xs font-bold text-white block truncate">{admin?.fullName || 'Manager'}</span>
            <span className="text-[10px] text-[#D4AF37] capitalize block">{admin?.role || 'admin'}</span>
          </div>
          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-200 hover:bg-rose-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-semibold text-stone-500 hidden sm:inline">
              Meetha Pani Backoffice Suite
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sound toggle button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast(`Order sound ${!soundEnabled ? 'enabled' : 'muted'}`);
              }}
              title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {/* Live site link */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#12372A] text-[#D4AF37] font-bold text-xs flex items-center justify-center">
              {admin?.fullName ? admin.fullName.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Main Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-xs bg-[#12372A] text-white flex flex-col z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
              <span className="font-serif font-bold text-base text-white">Meetha Pani Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#12372A] font-bold'
                          : 'text-stone-300 hover:bg-white/10'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  adminLogout();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-950 text-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
