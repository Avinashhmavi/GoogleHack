
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const pathname = usePathname();
  const router = useRouter();

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
    if (authStatus === 'loading') return;

    const isAuthPage = publicRoutes.includes(pathname);

    if (authStatus === 'unauthenticated' && !isAuthPage) {
      router.push('/login');
    } else if (authStatus === 'authenticated' && isAuthPage) {
      router.push('/');
    }
  }, [authStatus, pathname, router]);

  if (authStatus === 'loading') {
    return (
       <div className="flex items-center justify-center h-screen">
           <Loader2 className="w-16 h-16 animate-spin text-primary" />
       </div>
    );
  }

  // If we are on a public page, or we are authenticated, show the children
  if (publicRoutes.includes(pathname) || authStatus === 'authenticated') {
    return (
      <AuthContext.Provider value={{ user, authStatus }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // If we are unauthenticated and on a private page, show a loader while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
       <Loader2 className="w-16 h-16 animate-spin text-primary" />
    </div>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
