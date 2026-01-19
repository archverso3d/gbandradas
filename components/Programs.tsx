
import React from 'react';
import { Program } from '../types';

const programs: Program[] = [
  {
    id: 'gb-kids',
    title: 'GB Kids',
    description: 'Transformando crianças em campeões na vida através de disciplina e respeito.',
    image: '/programs/gb-kids-v2.png',
    target: 'Crianças de 3 a 15 anos'
  },
  {
    id: 'gb-1',
    title: 'GB1 Fundamentals',
    description: 'O ponto de partida para sua jornada. Aprenda as bases essenciais da defesa pessoal.',
    image: '/programs/gb1-v2.png',
    target: 'Iniciantes / Todos os Níveis'
  },
  {
    id: 'gb-2',
    title: 'GB2 Advanced',
    description: 'Aprofunde-se no jogo. Fluxo, transições e técnicas de alto nível para graduados.',
    image: '/programs/gb2-v2.png',
    target: 'Fundo Azul e acima'
  },
  {
    id: 'women',
    title: 'Women\'s Program',
    description: 'Um ambiente empoderador e seguro focado em defesa pessoal feminina e condicionamento.',
    image: '/programs/gb-women-v2.png',
    target: 'Mulheres de todas as idades'
  }
];

const Programs: React.FC = () => {
  return (
    <section id="programas" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Nossas Metas</h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900">Programas de Treinamento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="group cursor-pointer">
              <div className="relative overflow-hidden aspect-[4/5] mb-6">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Público</p>
                  <p className="text-red-400 font-medium text-sm">{program.target}</p>
                </div>
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-red-600 transition-colors">{program.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
