
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function will run on the client and attach the token to all fetch requests
const setupAuthInterceptor = (user: User | null) => {
    if (typeof window === 'undefined') return;

    // We patch the global fetch to automatically add the Authorization header
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const token = user ? await user.getIdToken() : null;

        const headers = new Headers(init?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
        
        return originalFetch(input, init);
    };
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!auth) {
        setAuthStatus("unauthenticated");
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setupAuthInterceptor(user);
      setAuthStatus(user ? "authenticated" : "unauthenticated");
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
