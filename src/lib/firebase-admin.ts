
import { initializeApp, getApps, App, cert } from "firebase-admin/app";

let app: App;

export async function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return;
    }
    
    let serviceAccount;
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            serviceAccount = JSON.parse((process.env.FIREBASE_SERVICE_ACCOUNT as string).replace(/\\n/g, '\n'));
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT env var is not set.");
            return;
        }
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
        return;
    }
    
    if (!serviceAccount) return;

    try {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK", e);
    }
}
