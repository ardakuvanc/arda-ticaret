import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, ArrowLeft, Gift, ShoppingBag, Copy, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { products, api, loading } = useStore(); // products comes from context global fetch
    const [activeTab, setActiveTab] = useState('products');
    const [codes, setCodes] = useState([]);
    const [codesLoading, setCodesLoading] = useState(false);

    // Fetch codes on mount or tab change
    const fetchCodes = useCallback(async () => {
        setCodesLoading(true);
        try {
            const data = await api.getCodes();
            setCodes(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Kodlar yüklenemedi");
        } finally {
            setCodesLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (activeTab === 'codes') {
            fetchCodes();
        }
    }, [activeTab, fetchCodes]);

    // Force refresh products? They are in context. Maybe trigger a re-fetch in context if needed, 
    // but user adding product here should update context if we listen or manually update.
    // For now product list comes from context which loads on mount/auth.

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

            {loading && <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-love-500" /></div>}

            {!loading && activeTab === 'products' && (
                <ProductManager products={products} api={api} />
            )}

            {!loading && activeTab === 'codes' && (
                <CodeManager codes={codes} loading={codesLoading} api={api} onRefresh={fetchCodes} />
            )}
        </div>
    );
}

function ProductManager({ products, api }) {
    const [newProduct, setNewProduct] = useState({ title: '', price: '', category: 'Genel', image: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) return;

        setSubmitting(true);
        try {
            await api.addProduct({
                ...newProduct,
                price: parseInt(newProduct.price)
            });
            // We need to refresh product list in context ideally.
            // Since context fetches on load, we might need a manual trigger or just reload page?
            // Or better, let's just let user reload for now or add to local list immediately?
            // Real solution: Context listens to Firestore collection.
            toast.success('Ürün eklendi (Sayfayı yenileyince görünecek)');
            setNewProduct({ title: '', price: '', category: 'Genel', image: '' });
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Silmek istediğine emin misin?')) {
            try {
                await api.deleteProduct(id);
                toast.success('Ürün silindi (Yenileyince gider)');
            } catch (e) {
                toast.error(e.message);
            }
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

                    <button disabled={submitting} type="submit" className="w-full bg-love-500 text-white font-bold py-3 rounded-xl hover:bg-love-600 transition-colors flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="animate-spin" /> : <><Plus size={18} /> Ekle</>}
                    </button>
                </form>
            </div>

            {/* Product List */}
            <div>
                <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                    Ürün Listesi
                    <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-love-500"><RefreshCw size={16} /></button>
                </h2>
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

function CodeManager({ codes, loading, api, onRefresh }) {
    const [newCode, setNewCode] = useState({ code: '', value: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCode.code || !newCode.value) return;

        setSubmitting(true);
        try {
            await api.addCode({
                code: newCode.code.toUpperCase().replace(/\s/g, ''),
                value: parseInt(newCode.value),
                active: true
            });
            setNewCode({ code: '', value: '' });
            toast.success('Hediye kodu oluşturuldu!');
            onRefresh();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        // Here id is actually code string in the old version but we should use doc ID if poss.
        // But for UI let's use the code string as ID for deleting if we implemented deleteCode by string logic.
        // Our api.deleteCode handled string matching?
        // Let's check api.deleteCode implementation: it searches by code string passed as ID.
        if (confirm('Kodu silmek istiyor musun?')) {
            try {
                await api.deleteCode(id); // id here is the code string actually based on iteration below
                onRefresh();
                toast.success('Kod silindi');
            } catch (e) {
                toast.error(e.message);
            }
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
                    <button disabled={submitting} type="submit" className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="animate-spin" /> : <><Gift size={18} /> Kod Oluştur</>}
                    </button>
                </form>
            </div>

            {/* Code List */}
            <div>
                <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                    Aktif Kodlar
                    <button onClick={onRefresh} className="text-gray-400 hover:text-love-500"><RefreshCw size={16} /></button>
                </h2>

                {loading ? <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-gray-400" /></div> : (
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
                )}
            </div>
        </>
    );
}
