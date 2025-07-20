
"use server"

import { auth } from "firebase-admin";
import { headers } from "next/headers";
import { initializeFirebaseAdmin } from "./firebase-admin";

export async function getAuthenticatedUser(token?: string | null) {
    await initializeFirebaseAdmin();
    
    const idToken = token ?? headers().get('Authorization')?.split('Bearer ')[1]

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        return decodedToken;
    } catch(error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}
