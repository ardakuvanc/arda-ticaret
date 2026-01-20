import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Gift, Clock, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, redeemCode, logout } = useStore();
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (confirm('Çıkış yapmak istediğine emin misin?')) {
            await logout();
            navigate('/login');
        }
    };

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
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-xl text-purple-500">
                        <Gift size={20} />
                    </div>
                    <h2 className="font-bold text-gray-800">Hediye Kodu</h2>
                </div>
                <form onSubmit={handleRedeem} className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Kodunu buraya gir..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-love-200 transition-all"
                    />
                    <button type="submit" className="bg-gray-800 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-black transition-colors">
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
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-red-400 font-bold bg-red-50 hover:bg-red-100 py-2 px-4 rounded-xl transition-colors"
                >
                    <LogOut size={16} />
                    Çıkış Yap
                </button>

                {user.isAdmin && (
                    <div className="mt-4 text-center w-full">
                        <Link to="/admin" className="text-xs text-love-400 hover:text-love-600 font-bold border border-love-100 px-3 py-1 rounded-full">🔧 Admin Paneline Geç</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
