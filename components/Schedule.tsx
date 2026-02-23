import React, { useState } from 'react';

const Schedule: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const programs = [
    { id: 'GB1', name: 'GB1 Foundation', color: 'bg-blue-600', textColor: 'text-white', description: 'Todos os níveis' },
    { id: 'GB2', name: 'GB2 Advanced', color: 'bg-purple-600', textColor: 'text-white', description: 'Faixa Branca 3 graus e acima' },
    { id: 'MC', name: 'Mini Campeões', color: 'bg-[#FFE4B5]', textColor: 'text-amber-900', description: '3-4 Anos' },
    { id: 'PC1', name: 'Pequenos C. 1', color: 'bg-yellow-400', textColor: 'text-yellow-900', description: '5-6 Anos' },
    { id: 'PC2', name: 'Pequenos C. 2', color: 'bg-orange-500', textColor: 'text-white', description: '7-9 Anos' },
    { id: 'Juniors', name: 'Juniors', color: 'bg-green-600', textColor: 'text-white', description: '10-15 Anos' },
    { id: 'GBF', name: 'GB Feminino', color: 'bg-pink-500', textColor: 'text-white', description: 'Turma exclusiva feminina' },
    { id: 'NOGI', name: 'NO GI', color: 'bg-indigo-600', textColor: 'text-white', description: 'Treino sem kimono' },
  ];

  const times = [
    { time: '07:30 - 09:00', events: ['GB1 / GB2 Adultos', 'GB1 / GB2 Adultos', 'GB1 / GB2 Adultos', 'GB1 / GB2 Adultos', 'GB1 / GB2 (NO GI)', '---'] },
    { time: '09:00 - 10:00', events: ['---', '---', '---', '---', '---', 'GB F (Feminino)'] },
    { time: '09:30 - 10:30', events: ['GBK (PC2)', 'GBK (MC + PC1)', 'GBK (PC2)', 'GBK (MC + PC1)', 'GBK (NO GI)', '---'] },
    { time: '10:00 - 11:00', events: ['---', '---', '---', '---', '---', 'GB1 (Todos Níveis) / GB2 (Treino Livre)'] },
    { time: '11:00 - 12:00', events: ['GB1 Adultos', 'GB1 Adultos', 'GB1 Adultos', 'GB1 Adultos', 'GB1 / GB2 (NO GI)', '---'] },
    { time: '16:30 - 17:30', events: ['GBK Juniors', 'GBK Juniors', 'GBK Juniors', 'GBK Juniors', 'GBK (NO GI)', '---'] },
    { time: '18:00 - 19:00', events: ['GBK (PC2)', 'GBK (MC + PC1)', 'GBK (PC2)', 'GBK (MC + PC1)', 'GBK (NO GI)', '---'] },
    { time: '19:00 - 20:00', events: ['GB1 (Todos Níveis)', 'GB1 (Todos Níveis)', 'GB F (Feminino)', 'GB1 (Todos Níveis)', 'GB1 (NO GI)', '---'] },
    { time: '20:00 - 21:00', events: ['GB2 Avançados', 'GB2 Avançados', 'GB2 Avançados', 'GB2 Avançados', 'GB2 (NO GI)', '---'] },
  ];

  const getEventStyle = (event: string) => {
    if (event === '---') return 'opacity-20 grayscale';

    let baseStyle = 'transition-all duration-300 transform hover:scale-105 shadow-sm ';
    let colorStyle = 'bg-gray-100 text-gray-800';
    let isMatch = false;

    // Default coloring logic
    if (event.includes('MC') && event.includes('PC1')) {
      colorStyle = 'bg-yellow-200 text-yellow-900 border-l-4 border-yellow-400'; // Mixed class
      if (activeFilter === 'MC' || activeFilter === 'PC1') isMatch = true;
    }
    else if (event.includes('MC')) {
      colorStyle = 'bg-[#FFE4B5] text-amber-900';
      if (activeFilter === 'MC') isMatch = true;
    }
    else if (event.includes('PC1')) {
      colorStyle = 'bg-yellow-400 text-yellow-900';
      if (activeFilter === 'PC1') isMatch = true;
    }
    else if (event.includes('PC2')) {
      colorStyle = 'bg-orange-500 text-white';
      if (activeFilter === 'PC2') isMatch = true;
    }
    else if (event.includes('Juniors')) {
      colorStyle = 'bg-green-600 text-white';
      if (activeFilter === 'Juniors') isMatch = true;
    }
    else if (event.includes('GB F')) {
      colorStyle = 'bg-pink-500 text-white';
      if (activeFilter === 'GBF') isMatch = true;
    }
    else if (event.includes('NO GI')) {
      colorStyle = 'bg-indigo-600 text-white';
      if (activeFilter === 'NOGI') isMatch = true;
    }
    else if (event.includes('GB1')) { // Put GB1/GB2 last as fallbacks for general names
      colorStyle = 'bg-blue-600 text-white';
      if (activeFilter === 'GB1') isMatch = true;
    }
    else if (event.includes('GB2')) {
      colorStyle = 'bg-purple-600 text-white';
      if (activeFilter === 'GB2') isMatch = true;
    }

    if (activeFilter && !isMatch) {
      baseStyle += 'opacity-30 scale-95 ';
    } else if (activeFilter && isMatch) {
      baseStyle += 'ring-2 ring-offset-1 ring-gray-400 z-10 ';
    }

    return `${baseStyle} ${colorStyle}`;
  };

  return (
    <section id="horarios" className="py-12 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-1">Organização</h2>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900">Grade de Horários</h3>
        </div>

        {/* Compact Legend / Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => setActiveFilter(activeFilter === program.id ? null : program.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs
                ${activeFilter === program.id
                  ? `${program.color} ${program.textColor} border-transparent shadow-md transform scale-105`
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${activeFilter === program.id ? 'bg-white' : program.color.replace('bg-', 'bg-')}`}></span>
              <span className="font-bold uppercase tracking-tight">{program.name}</span>
            </button>
          ))}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 font-bold text-xs uppercase hover:bg-gray-200 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="relative group/table">
          <div className="overflow-x-auto shadow-lg rounded-xl bg-white border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="py-3 px-4 font-black uppercase tracking-widest text-[10px] border-r border-zinc-800 sticky left-0 bg-zinc-900 z-20">Horário</th>
                  {days.map(day => (
                    <th key={day} className="py-3 px-2 font-black uppercase tracking-widest text-[10px] text-center border-r border-zinc-800 last:border-0">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {times.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3 px-4 font-black text-gray-900 border-r border-gray-100 whitespace-nowrap sticky left-0 bg-white group-hover:bg-gray-50 z-20 text-xs">
                      {row.time}
                    </td>
                    {row.events.map((event, eventIdx) => (
                      <td key={eventIdx} className="py-1.5 px-1 text-center border-r border-gray-50 last:border-0">
                        {event !== '---' ? (
                          <div className={`mx-auto max-w-[120px] px-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider leading-tight cursor-default ${getEventStyle(event)}`}>
                            {event}
                          </div>
                        ) : (
                          <span className="text-gray-200 font-light">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decorative gradients for scroll indication */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/50 pointer-events-none md:hidden" />
        </div>

        {/* Compact Observations */}
        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-xs text-gray-500 max-w-4xl mx-auto">
          <h4 className="font-black uppercase tracking-widest text-gray-900 mb-2 flex items-center gap-2 text-[10px]">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            Legenda & Observações
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <ul className="space-y-1">
              <li><strong className="text-gray-900">GB1:</strong> Fundamentos (Iniciantes)</li>
              <li><strong className="text-gray-900">GB2:</strong> Aprimoramento (Avançados)</li>
              <li><strong className="text-gray-900">GB F:</strong> Jiu-Jitsu Feminino</li>
              <li><strong className="text-gray-900">NO GI:</strong> Sem Kimono (Sextas)</li>
            </ul>
            <ul className="space-y-1">
              <li><strong className="text-gray-900">MC:</strong> Mini Campeões (3-4 Anos)</li>
              <li><strong className="text-gray-900">PC1:</strong> Pequenos Campeões 1 (5-6 Anos)</li>
              <li><strong className="text-gray-900">PC2:</strong> Pequenos Campeões 2 (7-9 Anos)</li>
              <li><strong className="text-gray-900">Juniors:</strong> Adolescentes (10-15 Anos)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Schedule;
