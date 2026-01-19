
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

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
    // { name: 'Painel Admin', href: '/admin' }, // Hidden from main menu to reduce clutter, accessed via login
    { name: 'Contato', href: '/#contato' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showSolidNavbar ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center mr-12">
            <img src="/logo.png" alt="Gracie Barra Andradas" className="h-20 w-auto transition-all" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center flex-1 justify-end">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${showSolidNavbar ? 'text-gray-800 hover:text-red-600' : 'text-white hover:text-red-400'}`}
              >
                {link.name}
              </a>
            ))}
            {!loading && (
              user ? (
                <button
                  onClick={() => navigate(isAdmin ? '/admin' : '/aluno')}
                  className={`border-2 px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all ${showSolidNavbar
                    ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                >
                  {isAdmin ? 'Painel Admin' : 'Área do Aluno'}
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`border-2 px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all ${showSolidNavbar
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                >
                  Área do Aluno
                </button>
              )
            )}
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-none font-bold uppercase text-xs tracking-widest transition-all">
              Aula Experimental
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${showSolidNavbar ? 'text-black' : 'text-white'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t border-gray-100 animate-fade-in-down max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-6 space-y-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-800 font-bold uppercase text-base tracking-widest border-b border-gray-50 pb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {!loading && (
                  user ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(isAdmin ? '/admin' : '/aluno');
                      }}
                      className="block w-full text-center text-red-600 font-bold uppercase text-sm tracking-widest border-2 border-red-600 p-4 hover:bg-red-600 hover:text-white transition-colors rounded-lg"
                    >
                      {isAdmin ? 'Acessar Painel Admin' : 'Acessar Área do Aluno'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsLoginOpen(true);
                      }}
                      className="block w-full text-center text-gray-800 font-bold uppercase text-sm tracking-widest border-2 border-gray-200 p-4 hover:border-red-600 hover:text-red-600 transition-colors rounded-lg"
                    >
                      Área do Aluno / Login
                    </button>
                  )
                )}
                <button className="w-full bg-red-600 text-white px-6 py-4 font-bold uppercase text-sm tracking-widest rounded-lg shadow-lg">
                  Aula Experimental
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;
