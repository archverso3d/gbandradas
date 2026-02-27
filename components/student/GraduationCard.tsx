import React from 'react';
import { Award, Calendar, TrendingUp } from 'lucide-react';

interface GraduationCardProps {
    currentBelt: string;
    degrees?: number;
    startDate: string; // ISO date string
    lastPromotionDate?: string; // ISO date string
    nextForecast?: string; // ISO date string
    certificateUrl?: string; // URL to certificate image/pdf
}

export const GraduationCard: React.FC<GraduationCardProps> = ({
    currentBelt,
    degrees = 0,
    startDate,
    lastPromotionDate,
    nextForecast,
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Helper to determine belt color styles with 3D effects
    const getBeltStyles = (belt: string) => {
        const lowerBelt = belt.toLowerCase();
        if (lowerBelt.includes('white') || lowerBelt.includes('branca'))
            return 'bg-white border-2 border-slate-200 text-slate-800 shadow-[0_4px_0_0_#e2e8f0]';
        if (lowerBelt.includes('blue') || lowerBelt.includes('azul'))
            return 'bg-blue-600 text-white shadow-[0_4px_0_0_#1d4ed8]';
        if (lowerBelt.includes('purple') || lowerBelt.includes('roxa'))
            return 'bg-purple-600 text-white shadow-[0_4px_0_0_#6d28d9]';
        if (lowerBelt.includes('brown') || lowerBelt.includes('marrom'))
            return 'bg-amber-800 text-white shadow-[0_4px_0_0_#78350f]';
        if (lowerBelt.includes('black') || lowerBelt.includes('preta'))
            return 'bg-black text-white shadow-[0_4px_0_0_#1e293b]';
        return 'bg-slate-100 text-slate-800 shadow-[0_4px_0_0_#cbd5e1]';
    };

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 p-5 flex flex-col transition-all hover:shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic flex items-center gap-2 drop-shadow-sm">
                        Minha Graduação
                    </h2>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-transform group-hover:-rotate-2 flex items-center gap-2 ${getBeltStyles(currentBelt)}`}>
                        {currentBelt}
                        {degrees > 0 && (
                            <span className="flex gap-0.5 ml-1">
                                {Array.from({ length: degrees }).map((_, i) => (
                                    <span key={i} className={`w-1 h-3 rounded-full ${currentBelt.toLowerCase().includes('white') || currentBelt.toLowerCase().includes('branca') ? 'bg-slate-300' : 'bg-white/40'}`} />
                                ))}
                                <span className="ml-1 opacity-80">{degrees}º GRAU</span>
                            </span>
                        )}
                    </span>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <Award className="w-4 h-4 text-red-600" />
                </div>
            </div>

            <div className="space-y-6 flex-1 relative z-10">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Início da Jornada</p>
                        <p className="text-slate-900 dark:text-slate-100 font-black italic text-lg leading-none">{formatDate(startDate)}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Última Graduação</p>
                        <p className="text-slate-900 dark:text-slate-100 font-black italic text-lg leading-none">{formatDate(lastPromotionDate)}</p>
                    </div>
                </div>

                {nextForecast && (
                    <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/20">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Previsão Próxima Graduação</p>
                        <p className="text-red-500 font-black text-2xl italic leading-none">{formatDate(nextForecast)}</p>
                        <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mt-2">*Estimativa baseada na frequência</p>
                    </div>
                )}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-800/20 rounded-full blur-3xl group-hover:bg-slate-800/30 transition-colors"></div>
        </div>
    );
};
