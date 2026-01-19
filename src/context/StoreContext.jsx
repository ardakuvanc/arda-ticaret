import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/db';
import { auth } from '../lib/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- AUTH LISTENER ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                // Fetch full User Data from Firestore
                const userData = await api.getUserData(currentUser.uid);
                if (userData) {
                    setUser({ uid: currentUser.uid, ...userData });
                } else {
                    // Fail-safe
                    setUser({ uid: currentUser.uid, email: currentUser.email });
                }
            } else {
                setUser(null);
            }
            // Always fetch products regardless of auth? or only if logged in?
            // Let's fetch public products.
            fetchProducts();
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchProducts = async () => {
        const prods = await api.getProducts();
        setProducts(prods);
    };

    // --- ACTIONS ---
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, name) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Create Firestore Doc
        await api.initializeUser(cred.user.uid, email, name);
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setCart([]);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success("Sepete eklendi! 🛒");
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const purchase = async () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        try {
            await api.purchaseCart(user.uid, cart, total, user.name);
            // Refresh user data (or listen real-time? For simplicity fetch again or manually update state)
            // Ideally Firestore onSnapshot would be better, but let's manual update for now.
            const updatedUser = await api.getUserData(user.uid);
            setUser({ uid: user.uid, ...updatedUser });

            clearCart();
            toast.success("Siparişin alındı aşkım! ❤️");
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const spinWheel = async (prize) => {
        try {
            await api.spinWheel(user.uid, prize);
            // Update local state
            const updatedUser = await api.getUserData(user.uid);
            setUser({ uid: user.uid, ...updatedUser });
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const redeemCode = async (code) => {
        try {
            const val = await api.redeemCode(user.uid, code);
            toast.success(`Harika! ${val} puan eklendi 🎉`);
            const updatedUser = await api.getUserData(user.uid);
            setUser({ uid: user.uid, ...updatedUser });
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const value = {
        user,
        loading,
        products,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        purchase,
        spinWheel,
        redeemCode,
        login,
        signup,
        logout,
        api // Expose api for admin usage
    };

    return (
        <StoreContext.Provider value={value}>
            {!loading && children}
        </StoreContext.Provider>
    );
};
