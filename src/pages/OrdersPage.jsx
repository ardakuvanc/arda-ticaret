import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, CheckCircle, Filter, User, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function OrdersPage() {
    const { user, api } = useStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllOrders, setShowAllOrders] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
    const [userFilter, setUserFilter] = useState('all'); // all | uid...

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, theme: 'love', icon: '⚠️' });

    const openConfirm = (title, message, onConfirm, theme = 'love', icon = '⚠️') => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, theme, icon });
    };

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const data = await api.getOrders(user.uid);
            setOrders(data);

            // Mark as seen when orders are loaded
            localStorage.setItem('lastOrdersViewed', new Date().toISOString());
        } catch (error) {
            console.error("Siparişler yüklenemedi:", error);
            toast.error("Siparişlerin yüklenemedi aşkım 🥺");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    // Unique Users for Filter
    const uniqueUsers = [...new Map(orders.map(order => [order.userId, order.userName])).entries()];

    const handleComplete = (orderId) => {
        openConfirm(
            "Teslimat Onayı",
            "Hediyeni teslim aldın mı? ❤️",
            async () => {
                try {
                    await api.completeOrder(orderId, user.uid);
                    toast.success("Afiyet olsun/Güle güle kullan! 🎉");
                    fetchOrders();
                } catch (error) {
                    toast.error(error.message);
                }
            },
            "love",
            "🎁"
        );
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        // Status Filter
        if (statusFilter === 'active' && order.status !== 'pending') return false;
        if (statusFilter === 'inactive' && order.status !== 'delivered') return false;

        // User Filter
        if (userFilter !== 'all' && order.userId !== userFilter) return false;

        return true;
    });

    if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

    return (
        <div className="pb-20">
            <h1 className="text-2xl font-hand font-bold text-love-600 mb-6 flex items-center gap-2">
                <Package size={24} />
                Siparişlerim
            </h1>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3">
                {/* User Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setUserFilter('all')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${userFilter === 'all'
                                ? 'bg-love-500 text-white border-love-500'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-love-300'
                            }`}
                    >
                        <User size={12} />
                        Herkes
                    </button>
                    {uniqueUsers.map(([uid, name]) => (
                        <button
                            key={uid}
                            onClick={() => setUserFilter(uid)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${userFilter === uid
                                    ? 'bg-love-500 text-white border-love-500'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-love-300'
                                }`}
                        >
                            {name || 'Bilinmeyen'}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${statusFilter === 'all'
                                ? 'bg-love-100 text-love-600 border-love-200'
                                : 'bg-white text-gray-500 border-gray-100'
                            }`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${statusFilter === 'active'
                                ? 'bg-orange-100 text-orange-600 border-orange-200'
                                : 'bg-white text-gray-500 border-gray-100'
                            }`}
                    >
                        Aktif (Bekleyen)
                    </button>
                    <button
                        onClick={() => setStatusFilter('inactive')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${statusFilter === 'inactive'
                                ? 'bg-green-100 text-green-600 border-green-200'
                                : 'bg-white text-gray-500 border-gray-100'
                            }`}
                    >
                        Geçmiş
                    </button>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-gray-50">
                    <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Bu filtreye uygun sipariş yok.</p>
                    <button
                        onClick={() => { setStatusFilter('all'); setUserFilter('all'); }}
                        className="mt-4 text-love-500 text-sm font-bold hover:underline flex items-center justify-center gap-1"
                    >
                        <RotateCcw size={14} /> Filtreleri Temizle
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.slice(0, showAllOrders ? undefined : 5).map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                            {/* Header */}
                            <div className={`flex justify-between items-start mb-4 border-b border-gray-50 pb-3 ${order.isUnlinked ? 'opacity-50 grayscale' : ''}`}>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                                        {order.isUnlinked && <span className="text-xs text-red-400 bg-red-50 px-1 rounded">(Eski Bağlantı)</span>}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mt-1 ${order.status === 'delivered'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {order.status === 'delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {order.status === 'delivered' ? 'Teslim Edildi' : 'Bekliyor'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${order.isUnlinked ? 'text-gray-500 line-through' : 'text-love-600'}`}>{order.totalPrice} SP</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded inline-block mt-1">{order.userName || 'Bilinmeyen'}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className={`space-y-2 mb-4 ${order.isUnlinked ? 'opacity-50' : ''}`}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className={`text-gray-700 ${order.isUnlinked ? 'line-through' : ''}`}>{item.title}</span>
                                        <span className="text-gray-400">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action - Hide button if unlinked */}
                            {order.status === 'pending' && !order.isUnlinked && (
                                <button
                                    onClick={() => handleComplete(order.id)}
                                    className="w-full bg-love-500 text-white font-bold py-2 rounded-xl text-sm hover:bg-love-600 transition-colors"
                                >
                                    Teslim Aldım ✅
                                </button>
                            )}
                        </div>
                    ))}

                    {filteredOrders.length > 5 && (
                        <button
                            onClick={() => setShowAllOrders(!showAllOrders)}
                            className="w-full py-3 text-xs font-bold text-gray-500 hover:text-love-500 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            {showAllOrders ? 'Daha Az Göster' : 'Tümünü Göster'}
                        </button>
                    )}
                </div>
            )}


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
