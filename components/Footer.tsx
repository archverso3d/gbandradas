
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contato" className="bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <img src="/logo.png" alt="Gracie Barra Andradas" className="h-16 w-auto mb-6" />
            <p className="text-gray-400 max-w-md leading-relaxed mb-8">
              Fundada sob os princípios da fraternidade, integridade e expansão do Jiu-Jitsu.
              Nossa escola é mais que um tatame, é uma família comprometida com o crescimento de cada aluno.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'instagram', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 border border-gray-800 rounded-full flex items-center justify-center hover:border-red-600 hover:text-red-600 transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current"></div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#programas" className="hover:text-white transition-colors">Programas</a></li>
              <li><a href="#horarios" className="hover:text-white transition-colors">Horários</a></li>
              <li><a href="#instrutores" className="hover:text-white transition-colors">Instrutores</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GB Wear Local</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Contato</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Andradas, Minas Gerais<br />R. Padre Mariano Garzo, 678</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+55 35 9164-7692</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Das 07:00 as 21:00 Seg a Sexta</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-bold">
          <p>&copy; 2024 Gracie Barra Andradas. Todos os direitos reservados.</p>
          <div className="flex flex-col items-center md:items-end gap-2 mt-4 md:mt-0">
            <p>Desenvolvido com excelência GB</p>
            <p className="text-[10px] text-gray-600 font-medium lowercase italic">v0.6.0 - 23/01/2026 - 10:49</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
