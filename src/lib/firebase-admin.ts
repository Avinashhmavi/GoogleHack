
import { initializeApp, getApps, App, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

let app: App;

export async function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return;
    }

    try {
        let serviceAccount;
        try {
            // First try to read from environment variable
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
            } else {
                // Fallback to reading from JSON file
                const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
                const serviceAccountData = readFileSync(serviceAccountPath, 'utf-8');
                serviceAccount = JSON.parse(serviceAccountData);
            }
        } catch (err) {
            // Final fallback to manual construction from GENKIT_* and GOOGLE_PROJECT_ID
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
