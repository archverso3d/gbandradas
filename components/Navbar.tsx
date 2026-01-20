
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { SCHOOL_INFO } from '../constants/schoolInfo';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useAuth();
  const notification = useNotification();

  // Force solid navbar on specific pages
  const solidPages = ['/aluno', '/mural', '/admin'];
  const isSolidPage = solidPages.includes(location.pathname);
  const showSolidNavbar = isScrolled || isSolidPage || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Programas', href: '/#programas' },
    { name: 'Horários', href: '/#horarios' },
    { name: 'Instrutores', href: '/#instrutores' },
    { name: 'Sobre Nós', href: '/#sobre' },
    { name: 'Contato', href: '/#contato' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${showSolidNavbar
          ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3 border-b border-gray-100/50'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <img
                src="/logo.png"
                alt="Gracie Barra Andradas"
                className="h-12 md:h-16 w-auto transition-all duration-500 group-hover:scale-105"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="flex items-center bg-gray-100/50 backdrop-blur-md rounded-full p-1.5 mr-4 border border-white/20">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-full ${showSolidNavbar
                      ? 'text-slate-600 hover:bg-white hover:text-red-600'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-full border border-slate-100">
                    <button
                      disabled={loading}
                      onClick={() => navigate(isAdmin ? '/admin' : '/aluno')}
                      className={`px-5 py-2.5 bg-slate-900 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? '...' : (isAdmin ? 'Admin' : 'Painel')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Force immediate logout
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/';
                      }}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className={`px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-[0.15em] transition-all ${showSolidNavbar
                      ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                      : 'bg-white text-slate-900 hover:bg-red-600 hover:text-white'
                      }`}
                  >
                    Área do Aluno
                  </button>
                )}

                <button
                  onClick={() => window.open(SCHOOL_INFO.whatsappUrl(), '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-200 hover:scale-105 active:scale-95"
                >
                  Aula Experimental
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl transition-colors ${showSolidNavbar ? 'bg-slate-50 text-slate-900' : 'bg-white/10 text-white backdrop-blur-md'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden ${mobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-4 text-slate-900 font-black uppercase text-sm tracking-widest border-b border-gray-50 flex items-center justify-between group active:bg-slate-50 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                  <span className="w-2 h-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </a>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              {user ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(isAdmin ? '/admin' : '/aluno');
                    }}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200"
                  >
                    Acessar Painel
                  </button>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      try {
                        await signOut();
                      } catch (err) {
                        console.error('Logout error:', err);
                      } finally {
                        navigate('/');
                      }
                    }}
                    className="w-full bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em]"
                  >
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full bg-white border-2 border-gray-100 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:border-red-600 transition-all"
                >
                  Login / Alunos
                </button>
              )}
              <button
                onClick={() => window.open(SCHOOL_INFO.whatsappUrl(), '_blank')}
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200"
              >
                Aula Experimental
              </button>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;
