import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Plus, Sparkles, Filter } from 'lucide-react';

export default function Shop() {
    const { products, addToCart } = useStore();
    const [activeCategory, setActiveCategory] = useState('Tümü');

    const categories = ['Tümü', ...new Set(products.map(p => p.category))];

    const filteredProducts = activeCategory === 'Tümü'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-hand font-bold text-love-600">Sevgi Mağazası</h1>
                <div className="bg-white p-2 rounded-full shadow-sm text-gray-400">
                    <Filter size={20} />
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-love-500 text-white shadow-md'
                                : 'bg-white text-gray-500 border border-gray-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col justify-between group">
                        <div className="text-center py-4">
                            <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                                {product.image}
                            </div>
                            <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1 h-10">{product.title}</h3>
                            <span className="text-xs text-gray-400">{product.category}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                            <span className="text-love-600 font-extrabold">{product.price} SP</span>
                            <button
                                onClick={() => addToCart(product)}
                                className="bg-love-100 text-love-600 p-2 rounded-full hover:bg-love-500 hover:text-white transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
