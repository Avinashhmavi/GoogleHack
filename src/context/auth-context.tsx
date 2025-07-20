
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function will run on the client and attach the token to all fetch requests
const setupAuthInterceptor = (user: User | null) => {
    if (typeof window === 'undefined') return;

    // We patch the global fetch to automatically add the Authorization header
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const token = user ? await user.getIdToken() : null;

        if (token) {
            const headers = new Headers(init?.headers);
            headers.set('Authorization', `Bearer ${token}`);
            init = { ...init, headers };
        }
        
        return originalFetch(input, init);
    };
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setupAuthInterceptor(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
