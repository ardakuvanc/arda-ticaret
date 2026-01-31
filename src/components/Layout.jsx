import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, ShoppingBag, Heart, User, Sparkles, Settings, Package, Bell, Copy } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Layout() {
    const { user, cart, api, notifications, unreadCount, clearNotifications } = useStore();
    const location = useLocation();
    const [orderCount, setOrderCount] = useState(0);

    // Fetch pending orders check for badge
    useEffect(() => {
        if (!user) return;
        const checkOrders = async () => {
            const count = await api.getPendingOrdersCount(user.uid);
            setOrderCount(count);
        };
        checkOrders();
        // Optional: Poll every 30s or listen to logic? 
        // For now simple fetch on mount/nav change
        const interval = setInterval(checkOrders, 10000);
        return () => clearInterval(interval);
    }, [user, location.pathname]); // Update when changing pages too

    const navItems = [
        { icon: Home, label: 'Ana Sayfa', path: '/' },
        { icon: ShoppingBag, label: 'Mağaza', path: '/shop' },
        { icon: Sparkles, label: 'Çark', path: '/wheel' },
        { icon: Package, label: 'Sipariş', path: '/orders' },
        { icon: User, label: 'Profil', path: '/profile' },
    ];

    return (
        <div className="min-h-screen pb-24 md:pb-0 bg-love-50 font-sans text-gray-800">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm px-4 py-3 flex justify-between items-center transition-all">
                <Link to="/" className="text-2xl font-hand text-love-600 font-bold select-none">Sevgi Mağazası</Link>
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    {user && (
                        <div className="relative group">
                            <button className="relative p-2 bg-love-50 rounded-full text-love-600 hover:bg-love-100 transition-colors">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                )}
                            </button>
                            {/* Dropdown */}
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 hidden group-hover:block transition-all z-50 overflow-hidden">
                                <div className="p-3 bg-love-50 border-b border-love-100 flex justify-between items-center">
                                    <span className="font-bold text-xs text-love-600">Bildirimler</span>
                                    <button onClick={clearNotifications} className="text-[10px] text-gray-500 hover:text-love-500 underline">Tümünü Temizle</button>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="text-center text-xs text-gray-400 py-4">Bildirim yok 💤</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                                <p className="font-bold text-xs text-gray-800 mb-0.5">{n.title}</p>
                                                <p className="text-[10px] text-gray-500">{n.message}</p>
                                                <p className="text-[8px] text-gray-400 text-right mt-1">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show Cart Icon if items exist */}
                    {cart.length > 0 && (
                        <Link to="/cart" className="relative p-2 bg-love-50 rounded-full text-love-600">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 bg-love-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        </Link>
                    )}

                    {user && (
                        <Link to="/profile" className="flex items-center gap-1.5 bg-love-100 px-3 py-1.5 rounded-full text-love-600 font-bold shadow-sm hover:bg-love-200 transition-colors">
                            <Heart className="w-4 h-4 fill-current animate-pulse" />
                            <span>{user.balance}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-lg mx-auto p-4 animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-love-100 px-6 py-2 flex justify-between items-center md:hidden z-50 pb-safe">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isOrders = item.path === '/orders';

                    return (
                        <Link key={item.path} to={item.path} className="relative group">
                            {isOrders && orderCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full z-10 border-2 border-white">
                                    {orderCount}
                                </span>
                            )}
                            <div className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive ? "text-love-500 -translate-y-1" : "text-gray-400")}>
                                <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110 fill-love-100")} />
                                <span className={cn("text-[10px] font-medium transition-opacity", isActive ? "opacity-100" : "opacity-70")}>{item.label}</span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="nav-pill" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-love-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
