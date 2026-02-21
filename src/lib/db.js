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
    where,
    orderBy
} from 'firebase/firestore';

// --- AYARLAR ---
const DAILY_SPIN_LIMIT = 1;

const generateConnectionCode = () => {
    // 6 Character Alphanumeric (Upper)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const api = {
    // --- USER DATA ---
    getUserData: async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            let data = userSnap.data();

            // Lazy Init: Kodu yoksa oluştur
            if (!data.connectionCode) {
                const newCode = generateConnectionCode();
                await updateDoc(userRef, { connectionCode: newCode });
                data.connectionCode = newCode;
            }

            // Partner Logic
            let partnerData = null;
            if (data.partnerUid) {
                const partnerSnap = await getDoc(doc(db, "users", data.partnerUid));
                if (partnerSnap.exists()) {
                    partnerData = partnerSnap.data();
                }
            }

            // Disable Shared Balance Logic - Keep Individual
            const ownBalance = data.balance || 0;
            const partnerBalance = partnerData ? (partnerData.balance || 0) : 0;
            // const totalBalance = ownBalance + partnerBalance; // REMOVED

            return {
                ...data,
                balance: ownBalance, // Return ONLY own balance
                ownBalance: ownBalance,
                partnerBalance: partnerBalance, // Still useful for UI
                partner: partnerData,
                partnerName: partnerData ? partnerData.name : null
            };
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
            history: [],
            connectionCode: generateConnectionCode(),
            partnerUid: null
        };
        await setDoc(doc(db, "users", uid), newUser);
        return newUser;
    },

    updateName: async (uid, newName) => {
        const name = newName.trim();
        if (name.length < 2 || name.length > 20) {
            throw new Error("İsim 2-20 karakter arasında olmalı");
        }

        // Uniqueness Check
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        const taken = querySnapshot.docs.some(doc => doc.id !== uid);
        if (taken) {
            throw new Error("Bu isim zaten alınmış! 😢");
        }

        // 1. Update User Name
        await updateDoc(doc(db, "users", uid), { name: name });

        // 2. Update All Past Orders
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(ordersRef, where("userId", "==", uid));
        const ordersSnapshot = await getDocs(ordersQuery);

        const updatePromises = ordersSnapshot.docs.map(orderDoc =>
            updateDoc(doc(db, "orders", orderDoc.id), { userName: name })
        );

        await Promise.all(updatePromises);
    },

    // --- PARTNER LINKING ---
    linkPartners: async (uid, partnerCode) => {
        // 1. Find partner by code
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("connectionCode", "==", partnerCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Bu koda sahip bir kullanıcı bulunamadı 😔");
        }

        const partnerDoc = querySnapshot.docs[0];
        const partnerUid = partnerDoc.id;

        if (partnerUid === uid) {
            throw new Error("Kendinle eşleşemezsin şapşik! 😋");
        }

        // 2. CHECK IF ALREADY REQUESTED
        const notifQuery = query(
            collection(db, "notifications"),
            where("userId", "==", partnerUid),
            where("senderId", "==", uid),
            where("type", "==", "link_request")
        );
        const existingReq = await getDocs(notifQuery);
        if (!existingReq.empty) {
            throw new Error("Zaten bir istek gönderdin, yanıt bekle! ⏳");
        }

        // 3. Send Request Notification to Partner
        const userSnap = await getDoc(doc(db, "users", uid));
        const userData = userSnap.data();

        await addDoc(collection(db, "notifications"), {
            userId: partnerUid,
            senderId: uid,
            type: 'link_request',
            title: 'Bağlantı İsteği! 🔗',
            message: `${userData.name || 'Gizli Hayran'} seninle bağlantı kurmak istiyor.`,
            meta: {
                senderName: userData.name || 'Gizli Hayran',
                senderBalance: userData.balance || 0
            },
            date: new Date().toISOString(),
            read: false
        });

        return userData.name || 'Partner';
    },

    approveLinkRequest: async (uid, senderId, notificationId) => {
        // Validation: If no senderId (legacy/broken data), just clear notification
        if (!senderId) {
            await deleteDoc(doc(db, "notifications", notificationId));
            return;
        }

        // 1. Update Both Users
        await updateDoc(doc(db, "users", uid), { partnerUid: senderId });
        await updateDoc(doc(db, "users", senderId), { partnerUid: uid });

        // 2. Send Success Notification to Sender
        const userSnap = await getDoc(doc(db, "users", uid));
        const userName = userSnap.data()?.name || 'Partnerin';

        await addDoc(collection(db, "notifications"), {
            userId: senderId,
            type: 'link_success',
            title: 'Kabul Edildi! 🎉',
            message: `${userName} bağlantı isteğini kabul etti.`,
            date: new Date().toISOString(),
            read: false
        });

        // 3. Delete the request notification
        await deleteDoc(doc(db, "notifications", notificationId));
    },

    rejectLinkRequest: async (uid, senderId, notificationId) => {
        // Validation: If no senderId (legacy/broken data), just clear notification
        if (!senderId) {
            await deleteDoc(doc(db, "notifications", notificationId));
            return;
        }

        // 1. Send Rejection Notification to Sender
        const userSnap = await getDoc(doc(db, "users", uid));
        const userName = userSnap.data()?.name || 'Partnerin';

        await addDoc(collection(db, "notifications"), {
            userId: senderId,
            type: 'link_rejected',
            title: 'Reddedildi 😔',
            message: `${userName} bağlantı isteğini reddetti.`,
            date: new Date().toISOString(),
            read: false
        });

        // 2. Delete the request notification
        await deleteDoc(doc(db, "notifications", notificationId));
    },

    unlinkPartners: async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (!userData.partnerUid) return;

        const partnerUid = userData.partnerUid;

        // Generate NEW codes for both
        const newCode1 = generateConnectionCode();
        const newCode2 = generateConnectionCode();

        // Add to previousPartners (for graying out orders if needed, or just history)
        // We do this for BOTH users.
        await updateDoc(doc(db, "users", uid), {
            partnerUid: null,
            previousPartners: arrayUnion(partnerUid),
            connectionCode: newCode1
        });

        await updateDoc(doc(db, "users", partnerUid), {
            partnerUid: null,
            previousPartners: arrayUnion(uid),
            connectionCode: newCode2
        });

        // Notify Partner
        await addDoc(collection(db, "notifications"), {
            userId: partnerUid,
            type: 'unlink',
            title: 'Bağlantı Kesildi 💔',
            message: `${userData.name} seninle bağlantıyı kesti.`,
            date: new Date().toISOString(),
            read: false
        });
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

    updateProduct: async (id, data) => {
        const docRef = doc(db, "products", id);
        await updateDoc(docRef, data);
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
        // Dublike Kontrolü (Sadece AKTİF olanları kontrol et)
        const q = query(
            collection(db, "codes"),
            where("code", "==", codeObj.code),
            where("active", "==", true)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            throw new Error("Bu kod zaten var ve aktif! Başka bir şey bul 🤔");
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
            throw new Error("Bu kod geçerli değil veya kullanılmış. Mlsf askm 😢");
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
        const lastSpinAt = userData.lastSpinAt ? new Date(userData.lastSpinAt).getTime() : 0;
        const twelveHoursMs = 12 * 60 * 60 * 1000;

        if (now.getTime() - lastSpinAt < twelveHoursMs) {
            throw new Error("Henüz süren dolmadı hayatım! 12 saatte bir şansın var ❤️");
        }

        await updateDoc(userRef, {
            balance: increment(prize),
            lastSpinAt: now.toISOString(), // Standardized
            history: arrayUnion({
                id: Date.now(),
                type: 'earn',
                description: 'Günün Şansı',
                amount: prize,
                date: now.toISOString()
            })
        });
    },

    purchaseCart: async (uid, cartItems, totalCost) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // 1. Check Individual Balance Only
        if (userData.balance < totalCost) {
            throw new Error("Yetersiz bakiye! 🥺");
        }

        // 2. Deduct from Own Balance
        await updateDoc(userRef, {
            balance: increment(-totalCost),
            history: arrayUnion({
                id: Date.now(),
                type: 'spend',
                description: `Sipariş (${cartItems.length} ürün)`,
                amount: totalCost,
                date: new Date().toISOString()
            })
        });

        // 3. Create Order
        await addDoc(collection(db, "orders"), {
            userId: uid,
            userName: userData.name,
            items: cartItems,
            totalPrice: totalCost,
            status: 'pending', // pending | delivered
            createdAt: new Date().toISOString()
        });

        // 4. In-App Notification (To Partner)
        if (userData.partnerUid) {
            await addDoc(collection(db, "notifications"), {
                userId: userData.partnerUid,
                type: 'order_partner', // Your partner ordered something (tsk: you fulfill it)
                title: 'Yeni Sipariş Var! 🎁',
                message: `${userData.name} bir sipariş verdi.`,
                date: new Date().toISOString(),
                read: false
            });

            // Notify Self? Maybe "Siparişin alındı" Notification?
            await addDoc(collection(db, "notifications"), {
                userId: uid, // Notify self
                type: 'order_self', // You ordered
                title: 'Siparişin Alındı ✅',
                message: 'Siparişin başarıyla oluşturuldu.',
                date: new Date().toISOString(),
                read: false
            });
        } else {
            // Notify Self
            await addDoc(collection(db, "notifications"), {
                userId: uid,
                type: 'order_self',
                title: 'Siparişin Alındı ✅',
                message: 'Siparişin başarıyla oluşturuldu.',
                date: new Date().toISOString(),
                read: false
            });
        }

        // 5. External Notification (Telegram/Email) - Keep existing logic
        try {
            const TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "";
            const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || "";

            const itemText = cartItems.map(i => `- ${i.title} (${i.quantity} adet)`).join('\n');
            const message = `🚨 *YENİ SİPARİŞ!* 🚨\n\n👤 *Kullanıcı:* ${userData.name}\n💰 *Tutar:* ${totalCost} SP\n\n🛒 *Ürünler:*\n${itemText}\n\n❤️ _Hemen ilgilen!_`;

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
    },

    // --- ORDERS ---
    getOrders: async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // 1. Current Partner's Orders + My Orders
        let searchUids = [uid];
        if (userData && userData.partnerUid) {
            searchUids.push(userData.partnerUid);
        }

        // 2. Also fetch "Old Partner" orders strictly to show them as crossed out?
        // Limitation: "in" query limited to 10 or 30. Safe.
        // If we strictly want to see them:
        if (userData && userData.previousPartners && userData.previousPartners.length > 0) {
            searchUids = [...searchUids, ...userData.previousPartners];
        }

        const q = query(
            collection(db, "orders"),
            where("userId", "in", searchUids)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map(doc => {
                const data = doc.data();
                // Mark as 'unlinked' ONLY if user is in previousPartners AND NOT the current partner
                const isUnlinked = userData.previousPartners?.includes(data.userId) && data.userId !== userData.partnerUid;
                return { id: doc.id, ...data, isUnlinked };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getPendingOrdersCount: async (uid) => {
        const orders = await api.getOrders(uid);
        return orders.filter(o => o.status === 'pending' && !o.isUnlinked).length;
    },

    getNewOrdersCount: async (uid, lastViewedDate) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // 1. Current Partner's Orders + My Orders
        let searchUids = [uid];
        if (userData && userData.partnerUid) {
            searchUids.push(userData.partnerUid);
        }

        const q = query(
            collection(db, "orders"),
            where("userId", "in", searchUids),
            where("createdAt", ">", lastViewedDate)
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    },

    completeOrder: async (orderId, uid) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data();

        if (orderData.userId !== uid) {
            throw new Error("Bu siparişi sadece siparişi veren kişi teslim alabilir! 🚫");
        }

        await updateDoc(orderRef, {
            status: 'delivered'
        });
    },

    // --- NOTIFICATIONS ---
    getNotifications: async (uid) => {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", uid)
        );
        const snapshot = await getDocs(q);
        // Sort in memory or use firebase index
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
            .slice(0, 5); // limit 5
    },

    clearNotifications: async (uid) => {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", uid)
        );
        const snapshot = await getDocs(q);
        // Delete all
        snapshot.forEach(async (d) => {
            await deleteDoc(doc(db, "notifications", d.id));
        });
    }
};
