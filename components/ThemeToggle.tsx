import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        fixed top-6 left-6 z-[110]
        p-3 rounded-2xl
        transition-all duration-500 ease-spring
        flex items-center justify-center
        group overflow-hidden
        ${theme === 'light'
                    ? 'bg-white/80 text-gray-800 shadow-xl shadow-gray-200/50 hover:shadow-gray-300/50 border border-gray-100'
                    : 'bg-gray-900/80 text-yellow-400 shadow-2xl shadow-black/50 hover:shadow-black/70 border border-gray-800'
                }
        backdrop-blur-md
        hover:scale-110 active:scale-95
      `}
            aria-label="Toggle Theme"
        >
            {/* Background Glow Effect */}
            <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500
        ${theme === 'light' ? 'bg-orange-400' : 'bg-yellow-400'}
      `} />

            <div className="relative z-10 w-6 h-6 flex items-center justify-center">
                {theme === 'light' ? (
                    <Sun className="w-6 h-6 animate-fade-in-down transition-transform group-hover:rotate-45" />
                ) : (
                    <Moon className="w-6 h-6 animate-fade-in-up transition-transform group-hover:-rotate-12" />
                )}
            </div>

            {/* Ripple/Slide effect base layer */}
            <div className={`
        absolute inset-0 -translate-x-full group-hover:translate-x-full
        transition-transform duration-1000 ease-in-out
        bg-gradient-to-r from-transparent via-white/10 to-transparent
      `} />
        </button>
    );
};

export default ThemeToggle;
