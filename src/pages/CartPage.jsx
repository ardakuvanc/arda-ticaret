import { useStore } from '../context/StoreContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, purchase } = useStore();

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-love-50 p-6 rounded-full text-love-200 mb-4">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">Sepetin Boş</h2>
                <p className="text-gray-500 text-sm mb-6">Henüz bir şey eklemedin aşkım.</p>
                <Link to="/shop" className="bg-love-500 text-white font-bold py-3 px-8 rounded-full shadow-lg">Mağazaya Git</Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-hand font-bold text-love-600 mb-6">Sepetim</h1>

            <div className="space-y-4 mb-32">
                {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
                        <div className="text-3xl">{item.image}</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                            <p className="text-love-500 font-bold text-xs">{item.price * item.quantity} SP</p>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-love-600 font-bold">-</button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-love-600 font-bold">+</button>
                        </div>

                        <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-20 md:bottom-24 left-0 right-0 px-4 md:static md:p-0 z-10">
                <div className="bg-white p-5 rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-sm border border-gray-50 max-w-lg mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 text-sm">Toplam Tutar</span>
                        <span className="text-xl font-bold text-love-600">{cartTotal} SP</span>
                    </div>
                    <button
                        onClick={purchase}
                        className="w-full bg-love-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-love-700 transition-colors shadow-lg shadow-love-200"
                    >
                        Satın Al <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
