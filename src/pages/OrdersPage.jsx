import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
    const { user, api } = useStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const data = await api.getOrders(user.uid);
            setOrders(data);
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

    const handleComplete = async (orderId) => {
        if (confirm("Hediyeni teslim aldın mı? ❤️")) {
            try {
                await api.completeOrder(orderId);
                toast.success("Afiyet olsun/Güle güle kullan! 🎉");
                fetchOrders(); // Listeyi yenile
            } catch (error) {
                toast.error("Bir hata oluştu");
            }
        }
    };

    if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

    return (
        <div className="pb-20">
            <h1 className="text-2xl font-hand font-bold text-love-600 mb-6 flex items-center gap-2">
                <Package size={24} />
                Siparişlerim
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-gray-50">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Henüz bir siparişin yok.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mt-1 ${order.status === 'delivered'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {order.status === 'delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {order.status === 'delivered' ? 'Teslim Edildi' : 'Bekliyor'}
                                    </span>
                                </div>
                                <span className="font-bold text-love-600">{order.totalPrice} SP</span>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.title}</span>
                                        <span className="text-gray-400">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action */}
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleComplete(order.id)}
                                    className="w-full bg-love-500 text-white font-bold py-2 rounded-xl text-sm hover:bg-love-600 transition-colors"
                                >
                                    Teslim Aldım ✅
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
