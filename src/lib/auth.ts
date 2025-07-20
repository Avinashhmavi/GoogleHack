
"use server"

import { auth } from "firebase-admin";
import { headers } from "next/headers";
import { initializeFirebaseAdmin } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// A simple in-memory cache for the decoded user token to avoid re-verifying on every server action within the same request.
let cachedUser: DecodedIdToken | null = null;

export async function getAuthenticatedUser(): Promise<DecodedIdToken | null> {
    if (cachedUser) {
        return cachedUser;
    }

    await initializeFirebaseAdmin();
    
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        cachedUser = decodedToken;
        return decodedToken;
    } catch(error) {
        console.error("Error verifying auth token:", error);
        // Reset cache on error
        cachedUser = null; 
        return null;
    }
}
