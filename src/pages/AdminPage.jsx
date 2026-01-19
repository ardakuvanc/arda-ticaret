import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, ArrowLeft, Gift, ShoppingBag, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { products, api } = useStore();
    const [activeTab, setActiveTab] = useState('products');
    const [codes, setCodes] = useState([]);

    useEffect(() => {
        // Fetch codes manually since they aren't in context state (kept securely in DB in real app, here in localstorage)
        const db = api.getData();
        setCodes(db.codes || []);
    }, []);

    const refreshCodes = () => {
        const db = api.getData();
        setCodes(db.codes || []);
    };

    return (
        <div className="pb-20">
            <div className="flex items-center gap-3 mb-6">
                <Link to="/profile" className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-love-500"><ArrowLeft size={20} /></Link>
                <h1 className="text-2xl font-bold font-hand text-love-600">Admin Paneli</h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-love-600' : 'text-gray-400'}`}
                >
                    <ShoppingBag size={16} /> Ürünler
                </button>
                <button
                    onClick={() => setActiveTab('codes')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'codes' ? 'bg-white shadow-sm text-love-600' : 'text-gray-400'}`}
                >
                    <Gift size={16} /> Kodlar
                </button>
            </div>

            {activeTab === 'products' ? (
                <ProductManager products={products} api={api} />
            ) : (
                <CodeManager codes={codes} api={api} onRefresh={refreshCodes} />
            )}
        </div>
    );
}

function ProductManager({ products, api }) {
    const [newProduct, setNewProduct] = useState({ title: '', price: '', category: 'Genel', image: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) return;

        api.addProduct({
            ...newProduct,
            price: parseInt(newProduct.price)
        });
        setNewProduct({ title: '', price: '', category: 'Genel', image: '' });
        toast.success('Ürün eklendi');
    };

    const handleDelete = (id) => {
        if (confirm('Silmek istediğine emin misin?')) {
            api.deleteProduct(id);
            toast.success('Ürün silindi');
        }
    }

    return (
        <>
            {/* Add Product */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-8">
                <h2 className="font-bold text-gray-800 mb-4">Yeni Ürün Ekle</h2>
                <form onSubmit={handleAdd} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ürün Adı</label>
                        <input
                            value={newProduct.title}
                            onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                            className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100"
                            placeholder="Örn: Kahve Ismarla"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fiyat (SP)</label>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100"
                                placeholder="100"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                            <input
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100"
                                placeholder="Yeme & İçme"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Emoji / Resim</label>
                        <input
                            value={newProduct.image}
                            onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                            className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100"
                            placeholder="☕"
                        />
                    </div>

                    <button type="submit" className="w-full bg-love-500 text-white font-bold py-3 rounded-xl hover:bg-love-600 transition-colors flex items-center justify-center gap-2">
                        <Plus size={18} /> Ekle
                    </button>
                </form>
            </div>

            {/* Product List */}
            <div>
                <h2 className="font-bold text-gray-800 mb-4">Ürün Listesi</h2>
                <div className="space-y-2">
                    {products.map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{product.image}</span>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{product.title}</p>
                                    <p className="text-xs text-gray-400">{product.category} • {product.price} SP</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(product.id)} className="text-red-300 hover:text-red-500 p-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

function CodeManager({ codes, api, onRefresh }) {
    const [newCode, setNewCode] = useState({ code: '', value: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newCode.code || !newCode.value) return;

        api.addCode({
            code: newCode.code.toUpperCase().replace(/\s/g, ''),
            value: parseInt(newCode.value),
            active: true
        });
        setNewCode({ code: '', value: '' });
        onRefresh();
        toast.success('Hediye kodu oluşturuldu!');
    };

    const handleDelete = (code) => {
        if (confirm('Kodu silmek istiyor musun?')) {
            api.deleteCode(code);
            onRefresh();
        }
    }

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Kopyalandı!');
    }

    return (
        <>
            {/* Create Code */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-8">
                <h2 className="font-bold text-gray-800 mb-4">Yeni Kod Oluştur</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kod Adı</label>
                        <input
                            value={newCode.code}
                            onChange={e => setNewCode({ ...newCode, code: e.target.value })}
                            className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100 uppercase"
                            placeholder="SENISEVIYORUM"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Değer (SP)</label>
                        <input
                            type="number"
                            value={newCode.value}
                            onChange={e => setNewCode({ ...newCode, value: e.target.value })}
                            className="w-full bg-gray-50 rounded-lg p-2 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-100"
                            placeholder="500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                        <Gift size={18} /> Kod Oluştur
                    </button>
                </form>
            </div>

            {/* Code List */}
            <div>
                <h2 className="font-bold text-gray-800 mb-4">Aktif Kodlar</h2>
                <div className="space-y-2">
                    {codes.length === 0 && <p className="text-sm text-gray-400">Henüz kod yok.</p>}
                    {codes.map((c, i) => (
                        <div key={i} className={`p-3 rounded-xl flex items-center justify-between shadow-sm border ${c.active ? 'bg-white border-gray-50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${c.active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <Gift size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 font-mono flex items-center gap-2">
                                        {c.code}
                                        <button onClick={() => copyCode(c.code)} className="text-gray-300 hover:text-love-500"><Copy size={12} /></button>
                                    </p>
                                    <p className="text-xs text-gray-400">{c.value} SP • {c.active ? 'Aktif' : 'Kullanıldı'}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(c.code)} className="text-red-300 hover:text-red-500 p-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
