"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useStore } from '@/lib/store';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isLoading: true,
    isAuthenticated: false
});

export function useAuth() {
    return useContext(AuthContext);
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const {
        setUser,
        setIsAuthenticated,
        setIsLoading,
        syncAllData,
        logout,
        isLoading,
        isAuthenticated
    } = useStore();

    useEffect(() => {
        const supabase = getSupabaseClient();

        // Check initial session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        full_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                        role: 'customer'
                    });
                    setIsAuthenticated(true);

                    // Sync cart and wishlist from database
                    await syncAllData();
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        full_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                        role: 'customer'
                    });
                    setIsAuthenticated(true);

                    // Sync cart and wishlist from database
                    await syncAllData();
                } else if (event === 'SIGNED_OUT') {
                    logout();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setIsAuthenticated, setIsLoading, syncAllData, logout]);

    return (
        <AuthContext.Provider value={{ isLoading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}
