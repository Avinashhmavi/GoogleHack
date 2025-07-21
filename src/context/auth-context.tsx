
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!auth) {
        setAuthStatus("unauthenticated");
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthStatus(user ? "authenticated" : "unauthenticated");
    });

    return () => unsubscribe();
  }, []);
  
   useEffect(() => {
    if (authStatus === 'authenticated' && user) {
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            const token = await user.getIdToken();
            const headers = new Headers(init?.headers);
            headers.set('Authorization', `Bearer ${token}`);
            return originalFetch(input, { ...init, headers });
        };
    }
  }, [authStatus, user]);


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
