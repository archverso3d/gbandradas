
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCHOOL_INFO } from '../constants/schoolInfo';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getAuthRedirectUrl } from '../utils/authHelpers';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPending, setRedirectPending] = useState<string | null>(null);

  React.useEffect(() => {
    if (redirectPending && user) {
      navigate(redirectPending, { replace: true });
      setRedirectPending(null);
    }
  }, [redirectPending, user, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_profile');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() }
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError('Erro ao entrar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (email.trim().toLowerCase() === 'aluno' && password === 'aluno') {
        signInDemo();
        setRedirectPending('/aluno');
        return;
      }

      localStorage.removeItem('demo_user_id');
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_profile');

      const effectiveEmail = email.trim().toLowerCase() === 'admin' ? 'admin@admin.com' : email.trim().toLowerCase();
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
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .single();
          setRedirectPending(profileData?.role === 'admin' ? '/admin' : '/aluno');
        } catch {
          setRedirectPending('/aluno');
        }
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      <div className="relative z-10 px-4 max-w-4xl w-full flex flex-col items-center">
        {/* Login Card / Welcome Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 mb-10 animate-fade-in-up">
          {user ? (
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900 mb-2">
                Bem-vindo de volta!
              </h3>
              <p className="text-gray-500 text-sm mb-6">Continue sua jornada agora mesmo.</p>
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/aluno')}
                className="w-full bg-red-600 hover:bg-black text-white p-4 font-black uppercase text-sm tracking-widest transition-all rounded-xl min-h-[56px] active:scale-95"
              >
                {isAdmin ? 'Ir para Painel Admin' : 'Ir para Área do Aluno'}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900">
                  Área do Aluno
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Acesse sua conta para ver seus treinos
                </p>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm font-bold text-center border bg-red-50 text-red-600 border-red-100 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 p-3 mb-4 hover:bg-gray-50 transition-colors font-bold text-sm disabled:opacity-50 rounded-xl min-h-[48px]"
                aria-label="Entrar com Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Entrar com Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Ou</span>
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors rounded-lg text-gray-900"
                  placeholder="E-mail"
                  autoComplete="email"
                  aria-label="Email"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors rounded-lg text-gray-900"
                  placeholder="Senha"
                  autoComplete="current-password"
                  aria-label="Senha"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-black text-white p-3 font-black uppercase text-sm tracking-widest transition-all disabled:opacity-50 rounded-xl min-h-[48px] active:scale-95"
                >
                  {loading ? 'Processando...' : 'Entrar'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Hero Text */}
        <div className="text-center">
          <h2 className="text-red-500 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base animate-fade-in">
            Jiu-Jitsu para Todos
          </h2>
          <h1 className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-tight animate-slide-up">
            Organizando a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              Escola do Mundo
            </span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Nossa missão é treinar o corpo, a mente e o espírito através dos mais altos padrões de ensino do Jiu-Jitsu Brasileiro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#programas" className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 font-bold uppercase text-sm tracking-widest transition-all w-full sm:w-auto">
              Ver Programas
            </a>
            <button
              onClick={() => window.open(SCHOOL_INFO.whatsappUrl(), '_blank')}
              className="border-2 border-white hover:bg-white hover:text-black text-white px-10 py-4 font-bold uppercase text-sm tracking-widest transition-all w-full sm:w-auto"
            >
              Aula Grátis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
