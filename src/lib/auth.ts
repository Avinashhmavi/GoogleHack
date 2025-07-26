
"use server"

import { auth } from "firebase-admin";
import { headers, cookies } from "next/headers";
import { initializeFirebaseAdmin } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// A simple in-memory cache for the decoded user token to avoid re-verifying on every server action within the same request.
let cachedUser: DecodedIdToken | null = null;

export async function getAuthenticatedUser(): Promise<DecodedIdToken | null> {
    if (cachedUser) {
        return cachedUser;
    }

    await initializeFirebaseAdmin();
    
    const headersList = await headers();
    const cookiesList = await cookies();
    
    // Try to get token from Authorization header first
    let idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    // If not found in headers, try to get from cookies
    if (!idToken) {
        idToken = cookiesList.get('firebase-token')?.value;
    }

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

// Alternative function that accepts token as parameter (for server actions)
export async function getAuthenticatedUserWithToken(idToken: string): Promise<DecodedIdToken | null> {
    await initializeFirebaseAdmin();

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
