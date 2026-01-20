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
    student_category: string | null;
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
        try {
            console.log('☢️ NUCLEAR LOGOUT INITIATED');
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error (ignored for cleanup):', error);
        } finally {
            setUser(null);
            setSession(null);
            setProfile(null);
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            console.log('✅ Clean-up completed. Redirecting...');
            window.location.href = '/';
        }
    };

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const initializeAuth = async () => {
            // CRITICAL: Safety timeout to prevent infinite loading
            timeoutId = setTimeout(() => {
                console.warn('⚠️ Auth initialization timeout - forcing loading to false');
                if (mounted) setLoading(false);
            }, 5000);

            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                clearTimeout(timeoutId);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    // REAL-TIME PROFILE SYNC
    useEffect(() => {
        if (!user) return;

        console.log(`🔌 Subscribing to real-time updates for user: ${user.id}`);
        const channel = supabase
            .channel(`public:user_profiles:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_profiles',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('🔄 Real-time profile update received:', payload);
                    if (payload.new) {
                        setProfile(prev => ({ ...prev, ...payload.new } as AuthProfile));
                    }
                }
            )
            .subscribe();

        return () => {
            console.log('🔌 Unsubscribing from real-time updates');
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

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
