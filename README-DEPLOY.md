# Love Store (Sevgi Magazasi)

Instructions to deploy and configure:

1.  **Deploy to Netlify**:
    *   Drag and drop the `dist` folder after running `npm run build`.
    *   OR connect your Git repository to Netlify.

2.  **Environment Variables**:
    *   Go to Netlify Site Settings > Environment Variables.
    *   Add `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather.
    *   Add `TELEGRAM_CHAT_ID`: Your numeric chat ID (you can get it from @userinfobot).

3.  **Database (Firebase)**:
    *   Currently, the app uses a **Mock Database** (LocalStorage) so you can test it immediately locally.
    *   To switch to Firebase, you need to create a project in [Firebase Console](https://console.firebase.google.com).
    *   Create a Firestore database.
    *   Copy the config into `src/lib/firebase.js` (you create this file).
    *   Update `src/lib/db.js` to use Firebase instead of LocalStorage.

4.  **Local Run**:
    *   `npm run dev`
