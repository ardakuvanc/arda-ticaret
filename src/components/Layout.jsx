import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Sparkles, Settings, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Layout() {
    const { user, cart } = useStore();
    const location = useLocation();

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
                    return (
                        <Link key={item.path} to={item.path} className="relative group">
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
