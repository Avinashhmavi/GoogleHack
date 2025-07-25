
import { initializeApp, getApps, App, cert } from "firebase-admin/app";

let app: App;

export async function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return;
    }

    try {
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
        } catch (err) {
            // Fallback to manual construction from GENKIT_* and GOOGLE_PROJECT_ID
            serviceAccount = {
                client_email: process.env.GENKIT_CLIENT_EMAIL,
                private_key: process.env.GENKIT_PRIVATE_KEY,
                project_id: process.env.GOOGLE_PROJECT_ID,
            };
            console.warn("FIREBASE_SERVICE_ACCOUNT parsing failed, using GENKIT_CLIENT_EMAIL, GENKIT_PRIVATE_KEY, and GOOGLE_PROJECT_ID as fallback.");
        }
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK", e);
    }
}
