import React from 'react';
import Hero from '../components/Hero';
import Programs from '../components/Programs';
import Schedule from '../components/Schedule';
import { SCHOOL_INFO } from '../constants/schoolInfo';

const Home: React.FC = () => {
    return (
        <main>
            <Hero />

            {/* About Section - Brief Intro */}
            <section id="sobre" className="py-24 border-b border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <img
                            src="/master-carlos.png"
                            alt="Mestre Carlos Gracie Jr."
                            className="w-full h-[600px] object-cover rounded-none shadow-2xl transition-all duration-700"
                        />
                        <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-red-600 hidden lg:flex items-center justify-center p-8">
                            <p className="text-white font-black text-2xl uppercase tracking-tighter leading-tight italic">
                                "O Jiu-Jitsu é para todos"
                                <span className="block text-sm font-normal not-italic mt-4 opacity-75">- Carlos Gracie Jr.</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4">Nossa Filosofia</h2>
                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8 leading-tight">
                            Mais de 30 Anos <br /> de Legado Global
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                            A Gracie Barra é a maior e mais bem sucedida equipe de Jiu-Jitsu do mundo. Em Andradas, trazemos essa excelência para você, com foco em um ambiente familiar, limpo e profissional.
                        </p>
                        <div className="grid grid-cols-2 gap-8 mt-12">
                            <div>
                                <h4 className="font-black text-3xl text-gray-900 dark:text-white">800+</h4>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Escolas no Mundo</p>
                            </div>
                            <div>
                                <h4 className="font-black text-3xl text-gray-900 dark:text-white">100%</h4>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Foco no Aluno</p>
                            </div>
                        </div>
                        <button className="mt-12 bg-black dark:bg-red-600 text-white dark:hover:bg-red-700 px-10 py-4 font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition-all">
                            Conheça Nossa História
                        </button>
                    </div>
                </div>
            </section>

            <Programs />

            {/* Instructors Section */}
            <section id="instrutores" className="py-24 bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Liderança</h2>
                            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Nossos Instrutores</h3>
                        </div>
                        <p className="text-gray-400 max-w-sm text-sm">Nossos professores são certificados pela GB Internacional e seguem um currículo pedagógico padronizado.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { role: 'Professor Principal', name: 'Josué "Chin" Tavares', rank: 'Faixa Preta 1º Grau', img: '/professor-chin.png' },
                            { role: 'Instrutor GB1', name: 'Adriel', rank: 'Faixa Roxa', img: '/instrutor-gabriel.png' },
                            { role: 'Instrutora GB Kids', name: 'Aline', rank: 'Faixa Azul', img: '/instrutor-aline.png' }
                        ].map((inst, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-6 border border-gray-800 p-2">
                                    <img src={inst.img} alt={inst.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <h4 className="text-xl font-bold uppercase tracking-tight">{inst.role}</h4>
                                <p className="text-gray-300 text-sm font-bold uppercase tracking-wider mt-1">{inst.name}</p>
                                <p className="text-red-600 text-xs font-black uppercase tracking-widest mt-1">{inst.rank}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Schedule />

            {/* Call to Action Banner */}
            <section className="bg-red-600 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">
                        Pronto para começar sua jornada?
                    </h3>
                    <button
                        onClick={() => window.open(SCHOOL_INFO.whatsappUrl(), '_blank')}
                        className="bg-white text-red-600 hover:bg-black hover:text-white px-12 py-5 font-black uppercase text-sm tracking-widest transition-all shadow-xl"
                    >
                        Agendar Minha Aula Grátis Agora
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Home;
