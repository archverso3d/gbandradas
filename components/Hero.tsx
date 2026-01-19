
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h2 className="text-red-600 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base animate-fade-in">Jiu-Jitsu para Todos</h2>
        <h1 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight animate-slide-up">
          Organizando a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Escola do Mundo</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Nossa missão é treinar o corpo, a mente e o espírito através dos mais altos padrões de ensino do Jiu-Jitsu Brasileiro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#programas" className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 font-bold uppercase text-sm tracking-widest transition-all w-full sm:w-auto">
            Ver Programas
          </a>
          <button className="border-2 border-white hover:bg-white hover:text-black text-white px-10 py-4 font-bold uppercase text-sm tracking-widest transition-all w-full sm:w-auto">
            Aula Grátis
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white opacity-50 animate-bounce">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
