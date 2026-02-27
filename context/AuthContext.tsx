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
    quiz_achievements: string[] | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: AuthProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    signInDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const isDemo = localStorage.getItem('demo_mode') === 'true';
        if (isDemo) {
            console.log('📋 [DEMO] Loading profile from localStorage');
            const demoProfile = localStorage.getItem('demo_profile');
            if (demoProfile) {
                setProfile(JSON.parse(demoProfile));
                return;
            }
        }

        try {
            console.log('📋 Fetching profile for userId:', userId);
            // Add a timeout to the profile fetch to prevent hanging the whole app
            const { data, error } = await Promise.race([
                supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single(),
                new Promise<any>((_, reject) =>
                    setTimeout(() => reject(new Error('Profile Fetch Timeout')), 3000)
                )
            ]);

            if (error) {
                console.error('❌ Error fetching profile:', error);
                setProfile(null);
            } else {
                console.log('✅ Profile fetched successfully:', {
                    userId: data.user_id,
                    role: data.role,
                    fullName: data.full_name
                });
                setProfile(data);
            }
        } catch (err) {
            console.error('❌ Profile fetch unexpected error:', err);
            // Don't set profile to null if it's just a timeout and we might have old data
            // but for now, null is safer to avoid inconsistent states
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const signOut = async () => {
        try {
            console.log('☢️ NUCLEAR LOGOUT INITIATED');
            // Use Promise.race to prevent hanging if Supabase is slow/unreachable
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SignOut Timeout')), 2000))
            ]);
        } catch (error) {
            console.error('Logout error (handled):', error);
        } finally {
            console.log('🧹 Clearing local data...');
            localStorage.removeItem('demo_user_id');
            localStorage.removeItem('demo_mode');
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

        const initializeAuth = async () => {
            try {
                // Ensure we start in loading state
                setLoading(true);
                console.log('🔐 [AUTH] Starting initialization...');

                // 1. Check for current session immediately
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('❌ [AUTH] Session retrieval error:', sessionError);
                }

                // Check for Demo Mode first
                const demoId = localStorage.getItem('demo_user_id');
                const isDemo = localStorage.getItem('demo_mode') === 'true';

                if (isDemo && demoId && mounted) {
                    console.log('🚀 [AUTH] Initializing in DEMO MODE');
                    const mockUser = {
                        id: demoId,
                        email: 'aluno@demo.com',
                        user_metadata: { full_name: 'Aluno Teste (Demo)' },
                        aud: 'authenticated',
                        role: 'authenticated'
                    } as any;

                    const storedProfile = localStorage.getItem('demo_profile');
                    const mockProfile = storedProfile ? JSON.parse(storedProfile) : {
                        user_id: demoId,
                        role: 'student',
                        full_name: 'Admin',
                        avatar_url: null,
                        current_belt: 'Faixa Branca',
                        degrees: 0,
                        start_date: new Date().toISOString(),
                        student_category: 'GB1',
                        quiz_achievements: []
                    };

                    localStorage.setItem('demo_profile', JSON.stringify(mockProfile));
                    setUser(mockUser);
                    setProfile(mockProfile as AuthProfile);
                    setLoading(false);
                    return;
                }

                if (mounted) {
                    if (initialSession) {
                        console.log('✅ [AUTH] Session restored from storage:', {
                            userId: initialSession.user.id,
                            email: initialSession.user.email
                        });
                        setSession(initialSession);
                        setUser(initialSession.user);
                        await fetchProfile(initialSession.user.id);
                    } else {
                        console.log('ℹ️ [AUTH] No existing session found on startup');
                        setSession(null);
                        setUser(null);
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error("❌ [AUTH] Initialization unexpected error:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    console.log('✅ [AUTH] Initialization complete');
                }
            }
        };

        // Initialize session
        initializeAuth();

        // Setup Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log(`🔐 [AUTH EVENT]: ${event}`, {
                hasSession: !!currentSession,
                userId: currentSession?.user?.id
            });

            if (!mounted) return;

            // Handle sign out event explicitly
            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            // For other events, update the session and user if they changed
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (event === 'SIGNED_IN') {
                    // Real user logged in via Supabase - clear any stuck demo mode
                    localStorage.removeItem('demo_user_id');
                    localStorage.removeItem('demo_mode');
                    localStorage.removeItem('demo_profile');
                }

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    setLoading(true);
                    fetchProfile(currentSession.user.id).finally(() => {
                        if (mounted) setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
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

    const signInDemo = () => {
        console.log('🚀 [AUTH_CONTEXT] Executing signInDemo. Setting localStorage...');
        const demoId = 'demo-user-aluno';

        const mockUser = {
            id: demoId,
            email: 'aluno@demo.com',
            user_metadata: { full_name: 'Aluno Teste (Demo)' },
            aud: 'authenticated',
            role: 'authenticated'
        } as any;

        const storedProfile = localStorage.getItem('demo_profile');
        const mockProfile = storedProfile ? JSON.parse(storedProfile) : {
            user_id: demoId,
            role: 'student',
            full_name: 'Admin',
            avatar_url: null,
            current_belt: 'Faixa Branca',
            degrees: 0,
            start_date: new Date().toISOString(),
            student_category: 'GB1',
            quiz_achievements: []
        };

        localStorage.setItem('demo_user_id', demoId);
        localStorage.setItem('demo_mode', 'true');
        localStorage.setItem('demo_profile', JSON.stringify(mockProfile));

        setUser(mockUser);
        setSession(null);
        setProfile(mockProfile as AuthProfile);
    };

    const isAdmin = profile?.role === 'admin';

    const value = {
        user,
        session,
        profile,
        loading,
        isAdmin,
        signOut,
        refreshProfile,
        signInDemo
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
