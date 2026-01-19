import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Gift, Clock, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user, redeemCode, api } = useStore();
    const [code, setCode] = useState('');

    const handleRedeem = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        const success = redeemCode(code.trim());
        if (success) setCode('');
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <div className="w-16 h-16 bg-love-100 rounded-full flex items-center justify-center text-love-500 font-bold text-2xl uppercase">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800">{user.name}</h1>
                    <p className="text-sm text-gray-500">{user.balance} Sevgi Puanı</p>
                </div>
            </div>

            {/* Redeem Code */}
            <div className="bg-gradient-to-r from-gold-400 to-yellow-300 p-5 rounded-2xl shadow-sm text-white">
                <div className="flex items-center gap-2 mb-3">
                    <Gift size={20} />
                    <h2 className="font-bold">Hediye Kodu</h2>
                </div>
                <form onSubmit={handleRedeem} className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Kodunu buraya gir..."
                        className="flex-1 rounded-xl px-4 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button type="submit" className="bg-white text-yellow-500 font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-50 transition-colors">
                        Kullan
                    </button>
                </form>
            </div>

            {/* History */}
            <div>
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Geçmiş Hareketler
                </h2>
                <div className="space-y-3">
                    {user.history.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">Henüz bir işlem yok.</p>
                    ) : (
                        user.history.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{item.description}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleString('tr-TR')}</p>
                                </div>
                                <span className={`font-bold text-sm ${item.type === 'earn' ? 'text-green-500' : 'text-red-400'}`}>
                                    {item.type === 'earn' ? '+' : ''}{item.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="py-4 text-center">
                <button onClick={() => { if (confirm('Sıfırlamak istediğine emin misin?')) api.resetData() }} className="text-xs text-red-300 underline">
                    Verileri Sıfırla (Çıkış)
                </button>
                <div className="mt-2 text-center w-full">
                    <Link to="/admin" className="text-[10px] text-gray-300 hover:text-love-400">Admin Paneli</Link>
                </div>
            </div>
        </div>
    );
}
