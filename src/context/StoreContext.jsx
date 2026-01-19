import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/db';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshData = () => {
        const data = api.getData();
        setUser(data.user);
        setProducts(data.products);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        window.addEventListener('db-update', refreshData);
        return () => window.removeEventListener('db-update', refreshData);
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success(`${product.title} sepete eklendi!`);
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const purchase = async () => {
        try {
            await api.purchaseCart(cart, cartTotal);
            toast.success('Siparişin başarıyla alındı aşkım! ❤️');
            clearCart();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const spinWheel = (amount) => {
        try {
            api.spinWheel(amount);
            toast.success(`Tebrikler! ${amount} Sevgi Puanı kazandın! 🎉`);
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const redeemCode = (code) => {
        try {
            const amount = api.redeemCode(code);
            toast.success(`${amount} Puan yüklendi!`);
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    return (
        <StoreContext.Provider value={{
            user,
            products,
            cart,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            purchase,
            spinWheel,
            redeemCode,
            api // Expose raw api for admin
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
