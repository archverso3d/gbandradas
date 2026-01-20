import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export const AuthCallbackHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session?.user) {
                    console.error('Error handling auth callback:', error);
                    navigate('/');
                    return;
                }

                // Check user role for proper redirection
                // We add a small retry or delay if profile is not found immediately (trigger race condition)
                let profile = null;
                for (let i = 0; i < 3; i++) {
                    const { data } = await supabase
                        .from('user_profiles')
                        .select('role')
                        .eq('user_id', session.user.id)
                        .single();
                    if (data) {
                        profile = data;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
                }

                if (profile?.role === 'admin') {
                    navigate('/admin');
                } else {
                    // Default to aluno area if profile is being created or is a regular student
                    navigate('/aluno');
                }
            } catch (err) {
                console.error('Unexpected error in auth callback:', err);
                navigate('/aluno'); // Better to try going to aluno area than home
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Autenticando...</p>
            </div>
        </div>
    );
};
