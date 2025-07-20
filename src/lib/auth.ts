
"use server"

import { auth } from "firebase-admin";
import { headers } from "next/headers";
import { initializeFirebaseAdmin } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

let cachedUser: DecodedIdToken | null = null;

export async function getAuthenticatedUser() {
    // In a server component, we can cache the user to avoid re-verifying the token on every call
    if (cachedUser) {
        return cachedUser;
    }

    await initializeFirebaseAdmin();
    
    const idToken = headers().get('Authorization')?.split('Bearer ')[1]

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        cachedUser = decodedToken;
        return decodedToken;
    } catch(error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}
