import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Gift, Clock, LogOut, Copy, Edit2, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PartnerLinkForm from '../components/PartnerLinkForm';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Profile() {
    const { user, redeemCode, logout, unlinkPartners, updateName, notifications, respondToLink } = useStore();
    const [code, setCode] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, theme: 'love', icon: '⚠️' });

    const openConfirm = (title, message, onConfirm, theme = 'love', icon = '⚠️') => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, theme, icon });
    };

    const handleLogout = () => {
        openConfirm(
            "Çıkış Yap",
            "Hesabından çıkış yapmak üzeresin. Emin misin?",
            async () => {
                await logout();
                navigate('/login');
            },
            "danger",
            "🚪"
        );
    };

    const handleRedeem = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        const success = redeemCode(code.trim());
        if (success) setCode('');

    };

    const handleNameEdit = () => {
        setEditName(user.name);
        setIsEditingName(true);
    };

    const saveName = async () => {
        if (!editName.trim() || editName === user.name) {
            setIsEditingName(false);
            return;
        }
        const success = await updateName(editName);
        if (success) setIsEditingName(false);
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <div className="w-16 h-16 bg-love-100 rounded-full flex items-center justify-center text-love-500 font-bold text-2xl uppercase">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-gray-50 border border-love-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-love-100"
                                    autoFocus
                                />
                                <button onClick={saveName} className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check size={16} /></button>
                                <button onClick={() => setIsEditingName(false)} className="p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200"><X size={16} /></button>
                            </div>
                        ) : (
                            <h1 onClick={handleNameEdit} className="font-bold text-lg text-gray-800 flex items-center gap-2 cursor-pointer hover:text-love-500 group transition-colors">
                                {user.name}
                                <Edit2 size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h1>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{user.balance} Sevgi Puanı</p>
                </div>
            </div>

            {/* Partner Connection */}
            <div className={`p-5 rounded-2xl shadow-sm border ${user.partnerUid ? 'bg-gradient-to-r from-pink-50 to-love-50 border-love-100' : 'bg-white border-gray-50'}`}>
                {user.partnerUid ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-white p-3 rounded-full mb-3 shadow-sm text-love-500">
                            <span className="text-2xl">❤️</span>
                        </div>
                        <h2 className="font-bold text-gray-800 text-lg">Bağlı Hesap</h2>
                        <p className="text-love-600 font-medium">{user.partnerName || 'Partner'} ile bağlısın!</p>



                        {/* Puan gösterimi kaldırıldı */}

                        <div className="mt-4">
                            <button
                                onClick={() => openConfirm(
                                    "Bağlantıyı Kes",
                                    "Partnerinle olan bağlantını kesmek üzeresin. Bu işlem geri alınamaz! 💔",
                                    unlinkPartners,
                                    "danger",
                                    "💔"
                                )}
                                className="text-xs text-red-300 hover:text-red-500 underline transition-colors"
                            >
                                Bağlantıyı Kes 💔
                            </button>
                        </div>
                    </div>
                ) : (
                    // ...
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-xl text-blue-500">
                                <span className="text-xl">🔗</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">Bağlı Hesaplar</h2>
                                <p className="text-xs text-gray-400">Puanlarını birleştir, gücüne güç kat!</p>
                            </div>
                        </div>

                        <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 flex justify-between items-center group cursor-pointer relative"
                            onClick={() => {
                                navigator.clipboard.writeText(user.connectionCode);
                                toast.success("Kod kopyalandı! 📋");
                            }}>
                            <span className="text-sm text-gray-500 font-medium">Senin Bağlantı Kodun:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-lg text-gray-800 bg-white px-3 py-1 rounded shadow-sm tracking-widest">{user.connectionCode}</span>
                                <Copy size={16} className="text-gray-400 group-hover:text-love-500 transition-colors" />
                            </div>
                        </div>

                        <PartnerLinkForm />

                        {/* Pending Requests */}
                        {notifications.filter(n => n.type === 'link_request').length > 0 && (
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-sm font-bold text-gray-700">Bekleyen İstekler</h3>
                                    {/* EMERGENCY CLEAR BUTTON */}
                                    <button
                                        onClick={() => openConfirm(
                                            "Temizle",
                                            "Tüm bekleyen istekleri temizlemek istiyor musun? Sorunlu istekler silinir.",
                                            async () => {
                                                notifications.filter(n => n.type === 'link_request').forEach(n => {
                                                    respondToLink(n.id, null, false);
                                                });
                                            },
                                            "danger",
                                            "🧹"
                                        )}
                                        className="text-[10px] text-red-500 underline"
                                    >
                                        Temizle
                                    </button>
                                </div>
                                {notifications.filter(n => n.type === 'link_request').map(req => (
                                    <div key={req.id} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">
                                                {req.meta?.senderName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{req.meta?.senderName || 'Biri'}</p>
                                                <p className="text-xs text-gray-500">{req.meta?.senderBalance} Puanı var</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600">Seninle bağlantı kurmak istiyor.</p>
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => respondToLink(req.id, req.senderId, true)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                            >
                                                Kabul Et
                                            </button>
                                            <button
                                                onClick={() => respondToLink(req.id, req.senderId, false)}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors"
                                            >
                                                Reddet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                theme={confirmModal.theme}
                icon={confirmModal.icon}
            />
        </div>
    );
}
