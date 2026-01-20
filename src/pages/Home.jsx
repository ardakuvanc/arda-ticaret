import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
    const { user, products } = useStore();

    if (!user) return null;

    const hours = new Date().getHours();
    let greeting = 'Merhaba';
    if (hours < 12) greeting = 'Günaydın';
    else if (hours < 18) greeting = 'Tünaydın';
    else greeting = 'İyi Geceler';

    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-love-400 to-love-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Heart size={120} fill="currentColor" />
                </div>

                <h1 className="text-3xl font-hand mb-2">{greeting}, {user.name}! ❤️</h1>
                <p className="opacity-90 mb-6 text-sm">Bugün ne kadar sevgi dolusun?</p>

                <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-bold">{user.balance}</span>
                    <span className="text-lg font-medium opacity-80 mb-1">Sevgi Puanı</span>
                </div>

                <Link to="/shop" className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2 text-sm font-bold hover:bg-white hover:text-love-500 transition-colors inline-flex items-center gap-2">
                    <Gift size={16} />
                    Harcamaya Başla
                </Link>
            </motion.div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Shopping Card */}
                <Link to="/shop" className="group col-span-1">
                    <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-40 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-love-50 rounded-full group-hover:bg-love-100 transition-colors"></div>
                        <div className="z-10 bg-love-100 w-12 h-12 rounded-2xl flex items-center justify-center text-love-500">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-gray-800 text-lg">Mağaza</h3>
                            <p className="text-xs text-gray-400 font-medium">Harcamaya Başla</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Wheel Card */}
                <Link to="/wheel" className="group col-span-1">
                    <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-40 bg-gradient-to-br from-yellow-100 to-orange-50 rounded-3xl p-5 shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-yellow-200/50 rounded-full animate-pulse"></div>
                        <div className="z-10 bg-white/60 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-500 backdrop-blur-sm">
                            <Sparkles size={24} />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-gray-800 text-lg">Şans Çarkı</h3>
                            <p className="text-xs text-gray-400 font-medium">
                                {user.lastSpinDate !== new Date().toDateString() || (user.spinCount || 0) < 1
                                    ? '✨ Şansın Var!'
                                    : 'Yarın tekrar dene'}
                            </p>
                        </div>
                    </motion.div>
                </Link>
            </div>

            {/* Gift Code Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Gift size={80} />
                </div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="bg-purple-100 p-2 rounded-xl text-purple-500">
                        <Gift size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Hediye Kodu Kullan</h3>
                </div>

                <CodeRedeemForm />
            </div>

            <div className="text-center pt-4">
                <p className="text-xs text-gray-300 italic">"Sen benim en değerli hediyemsin..."</p>
            </div>
        </div>
    );
}

function CodeRedeemForm() {
    const [code, setCode] = useState('');
    const { redeemCode } = useStore();

    const handleRedeem = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        const success = redeemCode(code.trim());
        if (success) setCode('');
    };

    return (
        <form onSubmit={handleRedeem} className="flex gap-2 relative z-10">
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Özel kodunu gir aşkım..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-love-200 transition-all"
            />
            <button
                type="submit"
                disabled={!code}
                className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowRight size={18} />
            </button>
        </form>
    );
}
