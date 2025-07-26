"use client";

import { auth } from "@/lib/firebase";

// Helper function to get the current user's ID token
async function getIdToken(): Promise<string | null> {
    if (!auth?.currentUser) {
        return null;
    }
    
    try {
        const token = await auth.currentUser.getIdToken();
        return token;
    } catch (error) {
        console.error("Error getting ID token:", error);
        return null;
    }
}

// Wrapper function to add authentication headers to server actions
export async function withAuth<T extends any[], R>(
    serverAction: (...args: T) => Promise<R>
): Promise<(...args: T) => Promise<R>> {
    return async (...args: T): Promise<R> => {
        const token = await getIdToken();
        
        if (!token) {
            throw new Error("User not authenticated");
        }
        
        // Set the token in localStorage for the server action to access
        if (typeof window !== 'undefined') {
            localStorage.setItem('firebase-token', token);
        }
        
        try {
            return await serverAction(...args);
        } finally {
            // Clean up the token after the action
            if (typeof window !== 'undefined') {
                localStorage.removeItem('firebase-token');
            }
        }
    };
} 