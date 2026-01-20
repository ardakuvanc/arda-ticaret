import { db } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    arrayUnion,
    increment,
    query,
    where
} from 'firebase/firestore';

// --- AYARLAR ---
const DAILY_SPIN_LIMIT = 1;

export const api = {
    // --- USER DATA ---
    getUserData: async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            // New user init (should be handled in signup, but fallback here)
            return null;
        }
    },

    initializeUser: async (uid, email, name) => {
        // Sadece arda@admin.com admin olabilir
        const isAdmin = email === "arda@admin.com";
        const newUser = {
            name: name || 'Aşkım',
            email,
            balance: 0,
            isAdmin: isAdmin,
            lastSpinDate: null,
            spinCount: 0,
            history: []
        };
        await setDoc(doc(db, "users", uid), newUser);
        return newUser;
    },

    // --- PRODUCTS ---
    getProducts: async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    },

    addProduct: async (product) => {
        const docRef = await addDoc(collection(db, "products"), product);
        return { id: docRef.id, ...product };
    },

    deleteProduct: async (id) => {
        await deleteDoc(doc(db, "products", id));
    },

    // --- CODES ---
    getCodes: async () => {
        // Admin only ideally
        const querySnapshot = await getDocs(collection(db, "codes"));
        const codes = [];
        querySnapshot.forEach((doc) => {
            codes.push({ id: doc.id, ...doc.data() });
        });
        return codes;
    },

    addCode: async (codeObj) => {
        // Dublike Kontrolü
        const q = query(collection(db, "codes"), where("code", "==", codeObj.code));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            throw new Error("Bu kod zaten var! Başka bir şey bul 🤔");
        }

        await addDoc(collection(db, "codes"), codeObj);
    },

    deleteCode: async (id) => {
        // Find doc by code string if id is unknown, but better to pass doc ID.
        // For simplicity let's assume we pass doc ID or query it.
        // If we only have the code string:
        const ref = collection(db, "codes");
        const snapshot = await getDocs(ref);
        snapshot.forEach(async d => {
            if (d.data().code === id) {
                await deleteDoc(doc(db, "codes", d.id));
            }
        });
    },

    redeemCode: async (uid, code) => {
        const codesRef = collection(db, "codes");
        const snapshot = await getDocs(codesRef);
        let foundDoc = null;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.code === code && data.active) {
                foundDoc = { id: doc.id, ...data };
            }
        });

        if (!foundDoc) {
            throw new Error("Bu kod geçerli değil veya kullanılmış 😢");
        }

        // Update User
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            balance: increment(foundDoc.value),
            history: arrayUnion({
                id: Date.now(),
                type: 'earn',
                description: `Hediye Kodu: ${code}`,
                amount: foundDoc.value,
                date: new Date().toISOString()
            })
        });

        // Deactivate Code
        await updateDoc(doc(db, "codes", foundDoc.id), {
            active: false
        });

        return foundDoc.value;
    },

    // --- ACTIONS ---
    spinWheel: async (uid, prize) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const now = new Date();
        const todayStr = now.toDateString();

        // Control Logic
        let currentSpins = userData.spinCount || 0;

        // Reset if new day
        if (userData.lastSpinDate !== todayStr) {
            currentSpins = 0;
            // We need to update this reset in DB as well, getting ready for the write
        }

        if (currentSpins >= DAILY_SPIN_LIMIT) {
            throw new Error("Bugünlük çark hakkın doldu kıvırcığım! Yarın yine gel ❤️"); // 00:00 logic is implicit by date string change
        }

        await updateDoc(userRef, {
            balance: increment(prize),
            lastSpinDate: todayStr,
            spinCount: (userData.lastSpinDate !== todayStr) ? 1 : increment(1),

            history: arrayUnion({
                id: Date.now(),
                type: 'earn',
                description: 'Günün Şansı',
                amount: prize,
                date: now.toISOString()
            })
        });
    },

    purchaseCart: async (uid, cartItems, totalCost, userName) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.data().balance < totalCost) {
            throw new Error("Ytrl svgi pnın yk mlsf 🥺 brz brktr!");
        }

        await updateDoc(userRef, {
            balance: increment(-totalCost),
            history: arrayUnion({
                id: Date.now(),
                type: 'spend',
                description: `Sipariş (${cartItems.length} ürün)`,
                amount: -totalCost,
                date: new Date().toISOString()
            })
        });

        // Notification - DIRECT CALL FOR RELIABILITY
        try {
            const TOKEN = "8436130388:AAE50k6sRCXQM0R__2zHoaoTKqJ3vAGsBVg";
            const CHAT_ID = "1132170971";

            const itemText = cartItems.map(i => `- ${i.title} (${i.quantity} adet)`).join('\n');
            const message = `🚨 *YENİ SİPARİŞ!* 🚨\n\n👤 *Kullanıcı:* ${userName}\n💰 *Tutar:* ${totalCost} SP\n\n🛒 *Ürünler:*\n${itemText}\n\n❤️ _Hemen ilgilen!_`;

            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        } catch (e) {
            console.log('Notification Err:', e);
        }
    }
};
