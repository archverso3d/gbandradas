import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getAuthRedirectUrl } from '../utils/authHelpers';


interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [redirectPending, setRedirectPending] = useState(false);
    const { refreshProfile, user, profile, isAdmin } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);



    // Handle redirect after successful login/signup AND context update
    React.useEffect(() => {
        if (redirectPending && user) {
            // We have a user in context, now check if we need to wait for profile
            // If we are admin, we definitely need profile to confirm role
            // If StudentArea checks profile, we might want to wait too, but usually user is enough for access

            // Just for safety, let's give a tiny delay or ensure profile is loaded if possible
            // But relying on 'profile' being non-null might hang if profile fetch fails

            const performRedirect = () => {
                setRedirectPending(false);
                onClose();
                if (isAdmin || (profile?.role === 'admin')) {
                    navigate('/admin');
                } else {
                    navigate('/aluno');
                }
            };

            // If profile is already loaded or we have a user and profile is loading... 
            // Let's just go. The pages handle their own loading states mostly.
            // But checking isAdmin requires profile.
            if (profile) {
                performRedirect();
            } else {
                // If profile is stuck, fallback to student after a timeout? 
                // Or just wait. AuthContext should fetch profile quickly.
            }
        }
    }, [redirectPending, user, profile, isAdmin, navigate, onClose]);


    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };



    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getAuthRedirectUrl(),

                }
            });

            if (oauthError) throw oauthError;
        } catch (err: any) {
            console.error('Google login error:', err);
            setError('Erro ao entrar com Google. Tente novamente.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                setLoading(false);
                return;
            }
        }

        try {
            if (mode === 'login') {
                const effectiveEmail = email.trim().toLowerCase() === 'admin' ? 'admin@admin.com' : email.trim().toLowerCase();
                console.log('Tentando login com:', effectiveEmail);
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: effectiveEmail,
                    password: password,
                });

                if (signInError) {
                    setError('Credenciais inválidas. Verifique e tente novamente.');
                    setLoading(false);
                    return;
                }

                if (data.session) {
                    // Trigger context refresh (optimistic)
                    await refreshProfile();
                    // Set flag to wait for context update in useEffect
                    setRedirectPending(true);
                }
            } else {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: getAuthRedirectUrl()

                    }
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setLoading(false);
                    return;
                }

                if (data.user) {
                    if (data.session) {
                        setRedirectPending(true);
                    } else {
                        setError('Cadastro realizado! Por favor, verifique seu e-mail.');
                        setLoading(false);
                    }
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Ocorreu um erro. Tente novamente.');
            setLoading(false);
        }
        // Note: We don't set loading(false) here if successful, expecting redirect to unmount or close
    };

    // Early return MOVED to after hooks to prevent "Rendered more hooks" error
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                        {mode === 'login' ? 'Área do Aluno' : 'Criar Conta'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {mode === 'login' ? 'Acesse sua conta para ver seus treinos' : 'Cadastre-se para começar sua jornada'}
                    </p>
                </div>

                {error && (
                    <div className={`p-3 mb-6 text-sm font-bold text-center border rounded ${error.includes('Cadastro realizado')
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 p-3 mb-6 hover:bg-gray-50 transition-colors font-bold text-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Ou com E-mail</span>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors"
                                placeholder="Seu Nome"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                            E-mail
                        </label>
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors"
                            placeholder="seu@email.com ou 'admin'"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-black text-white p-4 font-black uppercase text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                    </button>

                    <div className="text-center text-xs">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-gray-500 hover:text-red-600 transition-colors font-bold"
                        >
                            {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
                        </button>
                    </div>

                    {mode === 'login' && (
                        <div className="text-center text-xs pt-2">
                            <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Esqueceu sua senha?</a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
