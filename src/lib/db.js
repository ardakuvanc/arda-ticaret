export const DB_KEY = 'love_store_db';

const DEFAULT_PRODUCTS = [
    { id: '1', title: 'Bulaşıkları Ben Yıkarım', price: 100, category: 'Ev İşleri', image: '🍽️' },
    { id: '2', title: '1 Saat Masaj', price: 200, category: 'Özel Haklar', image: '💆‍♀️' },
    { id: '3', title: 'İstediğin Yemek Siparişi', price: 300, category: 'Yeme & İçme', image: '🍔' },
    { id: '4', title: 'Trip Atma Hakkı (Sorgusuz)', price: 500, category: 'Özel Haklar', image: '😤' },
    { id: '5', title: 'Film Gecesi Seçimi', price: 150, category: 'Aktivite', image: '🎬' },
    { id: '6', title: 'Kahve Ismarla', price: 50, category: 'Yeme & İçme', image: '☕' },
];

const DEFAULT_USER = {
    balance: 0,
    lastSpin: null,
    history: [],
    name: 'Aşkım',
    isAdmin: false
};

// Helper to get/set local storage
const getDB = () => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
        const initial = {
            user: DEFAULT_USER,
            products: DEFAULT_PRODUCTS,
            codes: [
                { code: 'SENICOKSEVIYORUM', value: 1000, active: true },
                { code: 'SURPRIZ', value: 500, active: true }
            ]
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(stored);
};

const saveDB = (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('db-update'));
};

export const api = {
    getData: () => getDB(),

    spinWheel: (prize) => {
        const db = getDB();
        const now = new Date().toISOString();

        if (db.user.lastSpin) {
            const last = new Date(db.user.lastSpin).toDateString();
            const today = new Date().toDateString();

            // --- GÜNLÜK SINIR AYARI ---
            // Sınırı kaldırmak için alttaki 3 satırı yorum satırına (//) alın:
            //if (last === today) {
            //  throw new Error("Bugün zaten şansını denedin aşkım! Yarın yine gel ❤️");
            //}
            // ---------------------------
        }

        db.user.balance += prize;
        db.user.lastSpin = now;
        db.user.history.unshift({
            id: Date.now(),
            type: 'earn',
            description: 'Günün Şansı',
            amount: prize,
            date: now
        });

        saveDB(db);
        return db.user;
    },

    purchaseCart: async (cartItems, totalCost) => {
        const db = getDB();
        if (db.user.balance < totalCost) {
            throw new Error("Yeterli sevgi puanın yok kıvırcığım 🥺 Biraz biriktirelim!");
        }

        db.user.balance -= totalCost;

        const itemsSummary = cartItems.map(i => `${i.title} (${i.quantity}x)`).join(', ');

        db.user.history.unshift({
            id: Date.now(),
            type: 'spend',
            description: `Sipariş: ${itemsSummary}`,
            amount: -totalCost,
            date: new Date().toISOString()
        });

        saveDB(db);

        // Call Netlify Function
        // IMPORTANT: For this to work locally, you need `netlify dev`.
        // Or we can just log it console for now if 404.
        try {
            // DIRECT TELEGRAM CALL (For Local Testing)
            // Normalde backend üzerinden yapılır ama npm run dev ile test ederken garantili olsun diye buradan atıyoruz.
            const TOKEN = "8436130388:AAE50k6sRCXQM0R__2zHoaoTKqJ3vAGsBVg";
            const CHAT_ID = "1132170971";

            const itemText = cartItems.map(i => `- ${i.title} (${i.quantity} adet)`).join('\n');
            const message = `🚨 *YENİ SİPARİŞ!* 🚨\n\n👤 *Kullanıcı:* ${db.user.name}\n💰 *Tutar:* ${totalCost} SP\n\n🛒 *Ürünler:*\n${itemText}\n\n❤️ _Hemen ilgilen!_`;

            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            console.log("Telegram mesajı gönderildi! ✅");
        } catch (e) {
            console.log('Notification sending failed:', e);
        }

        return db.user;
    },

    redeemCode: (code) => {
        const db = getDB();
        const foundCode = db.codes.find(c => c.code === code && c.active);

        if (!foundCode) {
            throw new Error("Bu kod geçerli değil veya kullanılmış 😢");
        }

        db.user.balance += foundCode.value;
        db.user.history.unshift({
            id: Date.now(),
            type: 'earn',
            description: `Hediye Kodu: ${code}`,
            amount: foundCode.value,
            date: new Date().toISOString()
        });

        foundCode.active = false;
        saveDB(db);
        return foundCode.value;
    },

    addProduct: (product) => {
        const db = getDB();
        const newProduct = { ...product, id: Date.now().toString() };
        db.products.push(newProduct);
        saveDB(db);
        return newProduct;
    },

    deleteProduct: (id) => {
        const db = getDB();
        db.products = db.products.filter(p => p.id !== id);
        saveDB(db);
    },

    updateProduct: (product) => {
        const db = getDB();
        const index = db.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            db.products[index] = product;
            saveDB(db);
        }
    },

    // --- CODE MANAGEMENT ---
    addCode: (codeObj) => {
        const db = getDB();
        // Check duplicate
        if (!db.codes) db.codes = [];
        if (db.codes.find(c => c.code === codeObj.code)) {
            // Overwrite if exists logic? specific message?
            // Let's just update
            const index = db.codes.findIndex(c => c.code === codeObj.code);
            db.codes[index] = codeObj;
        } else {
            db.codes.push(codeObj);
        }
        saveDB(db);
    },

    deleteCode: (codeStr) => {
        const db = getDB();
        if (!db.codes) return;
        db.codes = db.codes.filter(c => c.code !== codeStr);
        saveDB(db);
    },

    resetData: () => {
        localStorage.removeItem(DB_KEY);
        window.location.reload();
    }
};
