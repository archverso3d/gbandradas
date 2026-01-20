import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthProfile {
    user_id: string;
    role: 'admin' | 'student';
    full_name: string | null;
    avatar_url: string | null;
    current_belt: string;
    degrees: number;
    start_date: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: AuthProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Profile fetch unexpected error:', err);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const signOut = async () => {
        /**
         * SEGURANÇA & BOAS PRÁTICAS:
         * 1. Backend SignOut: Invalida o token JWT no servidor Supabase.
         * 2. State Cleanup: Remove o usuário do estado global do React para atualizar a UI instantaneamente.
         * 3. Storage Cleanup: Remove manualmente chaves do localStorage para evitar persistência indesejada.
         * 4. Session/Cookie Cleanup: Limpa dados residuais para mitigar sequestro de sessão.
         */
        try {
            console.log('AuthContext: Iniciando processo de logout...');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro ao encerrar sessão no Supabase:', error);
            }
        } catch (error) {
            console.error('Erro inesperado durante o logout:', error);
        } finally {
            // Limpa o estado global independente do resultado da requisição de rede
            setUser(null);
            setSession(null);
            setProfile(null);

            try {
                // Limpeza agressiva do LocalStorage (Supabase usa o prefixo 'sb-')
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));

                // Limpa SessionStorage para evitar vazamento de dados entre abas
                sessionStorage.clear();

                // Limpeza opcional de cookies residuais (boa prática de segurança)
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                console.log('AuthContext: Estado local e storage limpos com sucesso.');
            } catch (storageError) {
                console.error('Erro ao limpar storage durante o logout:', storageError);
            }
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // Safety timeout: force loading to false after 5s to prevent infinite spinner
            const timeoutId = setTimeout(() => setLoading(false), 5000);

            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            // Ensure loading is turned off after auth change
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isAdmin = profile?.role === 'admin';

    const value = {
        user,
        session,
        profile,
        loading,
        isAdmin,
        signOut,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
