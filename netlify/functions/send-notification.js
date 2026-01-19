exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { items, total, user, chat_id } = JSON.parse(event.body);

        // FOR TESTING ONLY - User provided token
        const BOT_TOKEN = "8436130388:AAE50k6sRCXQM0R__2zHoaoTKqJ3vAGsBVg";
        const TARGET_CHAT_ID = chat_id || process.env.TELEGRAM_CHAT_ID; // We need a Chat ID

        if (!BOT_TOKEN || !TARGET_CHAT_ID) {
            console.log("Missing credentials");
            return { statusCode: 400, body: JSON.stringify({ message: "Chat ID missing! Please provide it or set env var." }) };
        }

        const itemText = items.map(i => `- ${i.title} (${i.quantity} adet)`).join('\n');
        const message = `🚨 *YENİ SİPARİŞ!* 🚨\n\n👤 *Kullanıcı:* ${user}\n💰 *Tutar:* ${total} SP\n\n🛒 *Ürünler:*\n${itemText}\n\n❤️ _Hemen ilgilen!_`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        // We would use node-fetch here, but standard node https is built-in. 
        // For simplicity in Netlify functions (Node 18+), fetch is global.
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TARGET_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API Error:", data);
            throw new Error(data.description);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Notification sent!" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
