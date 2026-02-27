import React, { useMemo } from 'react';
import { TrainingFocusChart } from './TrainingFocusChart';
import { Share2, Target, Award, Swords } from 'lucide-react';
import { AttendanceRecord } from '../../pages/StudentArea';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface ReportSummaryCardProps {
    attendanceData: AttendanceRecord[];
    onShare: () => void;
    sharing: boolean;
    completedClasses: number;
    performance: number;
    streak: number;
    currentBelt: string;
    degrees: number;
}

const getBeltColor = (belt: string): string => {
    const b = belt.toLowerCase();
    if (b.includes('white') || b.includes('branca')) return '#94a3b8';
    if (b.includes('blue') || b.includes('azul')) return '#2563EB';
    if (b.includes('purple') || b.includes('roxa')) return '#7E22CE';
    if (b.includes('brown') || b.includes('marrom')) return '#92400e';
    if (b.includes('black') || b.includes('preta')) return '#1e293b';
    return '#2563EB';
};

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
    attendanceData,
    onShare,
    sharing,
    completedClasses,
    performance,
    streak,
    currentBelt,
    degrees
}) => {
    const beltColor = getBeltColor(currentBelt);

    const sparringStats = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const isAttendancePresent = (a: AttendanceRecord) =>
            ['present', 'presente', 'a', 'b', 'n', 'p'].includes(a.status.toLowerCase());

        const monthlySessions = attendanceData.filter(a => {
            if (!isAttendancePresent(a)) return false;
            const d = new Date(a.date + 'T12:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const yearlySessions = attendanceData.filter(a => {
            if (!isAttendancePresent(a)) return false;
            const d = new Date(a.date + 'T12:00:00');
            return d.getFullYear() === currentYear;
        }).length;

        const allTimeSessions = attendanceData.filter(isAttendancePresent).length;

        return {
            monthly: { gb1: monthlySessions * 2, gb2: monthlySessions * 3, total: monthlySessions * 5 },
            yearly: { total: yearlySessions * 5 },
            allTime: { total: allTimeSessions * 5 }
        };
    }, [attendanceData]);
    return (
        <div className="relative">
            {/* The Balloon - Outside of overflow-hidden container */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[110]">
                <div className="relative w-full md:w-[400px] h-full mx-auto md:mx-0">
                    <InstructionBalloon
                        id="report-summary-info"
                        text="Neste relatório consolidado, você tem um resumo do seu desempenho geral e estatísticas de combate (sparrings)."
                        position="bottom"
                        className="!pointer-events-auto mt-16"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl overflow-hidden relative group">
                {/* Header */}
                <div className="p-6 border-b-2 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">
                                    Relatório de Performance
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Visão geral do seu desenvolvimento</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Rank Info Bar */}
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                            <Award className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Graduação Atual</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{currentBelt}</span>
                                {degrees > 0 && (
                                    <span style={{ backgroundColor: beltColor }} className="text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                        {degrees}º GRAU
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Aulas</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white italic">{completedClasses}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Ofensiva</p>
                            <p className="text-xl font-black text-red-500 italic">{streak}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Aproveit.</p>
                            <p className="text-xl font-black text-blue-500 italic">{performance}%</p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] p-2 border-2 border-slate-100 dark:border-slate-800/50 mb-4">
                        <TrainingFocusChart attendanceData={attendanceData} />
                    </div>

                    {/* Sparrings Section */}
                    <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Swords className="w-4 h-4 text-red-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Combates Realizados</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-0.5">GB1</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white italic">{sparringStats.monthly.gb1}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-tight">Treinos Esp.</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-0.5">GB2</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white italic">{sparringStats.monthly.gb2}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-tight">Lutas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-0.5">Mensal</p>
                                <p className="text-2xl font-black italic text-red-600">{sparringStats.monthly.total}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-tight">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-0.5">JORNADA</p>
                                <p className="text-2xl font-black italic text-red-600">{sparringStats.allTime.total}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-tight">Total</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                            <p className="text-[10px] font-black italic text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                "Eu já saí na porrada: <span className="text-red-500 dark:text-red-400">{sparringStats.yearly.total} vez{sparringStats.yearly.total === 1 ? '' : 'es'}</span> este ano"
                            </p>
                        </div>
                    </div>


                    {/* Share Button */}
                    <button
                        onClick={onShare}
                        disabled={sharing}
                        className={`group/btn relative flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] italic transition-all duo-btn-3d text-sm w-full shadow-xl overflow-hidden ${sharing
                            ? 'opacity-50 cursor-wait bg-slate-100 text-slate-400'
                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                        <Share2 className={`w-5 h-5 ${sharing ? 'animate-spin' : 'group-hover/btn:rotate-12 transition-transform'}`} />
                        <span>{sharing ? 'GERANDO RELATÓRIO...' : 'COMPARTILHAR PROGRESSO'}</span>
                    </button>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
            </div>
        </div>
    );
};
