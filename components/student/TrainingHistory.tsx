import React, { useMemo, useState } from 'react';
import { Flame, History, CheckCircle2 } from 'lucide-react';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface TrainingHistoryProps {
    attendanceData: AttendanceRecord[];
    studentStartDate: string;
    studentCategory?: string;
}

// Helper to check if a status counts as present
const isPresent = (status: string | undefined) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === 'present' || s === 'presente' || s === 'a' || s === 'b' || s === 'n' || s === 'p';
};

// Helper to get Year-Week identifier using local date
const getYearWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00'); // Use mid-day to avoid TZ shifts
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `${target.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

export const TrainingHistory: React.FC<TrainingHistoryProps> = ({ attendanceData, studentStartDate, studentCategory }) => {
    const [showAllHistory, setShowAllHistory] = useState(false);

    const stats = useMemo(() => {
        if (!attendanceData) {
            return { completedWeeks: 0, lostWeeks: 0, currentStreak: 0, stars: 0, history: [] };
        }

        // Group attendance by week and types
        const weeksMap = new Map<string, Set<string>>();
        attendanceData.forEach(record => {
            if (isPresent(record.status)) {
                const weekId = getYearWeek(record.date);
                if (!weeksMap.has(weekId)) weeksMap.set(weekId, new Set());

                const label = (record.classLabel || '').toUpperCase();
                if (label.includes('A') || label === 'A') weeksMap.get(weekId)?.add('A');
                else if (label.includes('B') || label === 'B') weeksMap.get(weekId)?.add('B');
                else if (label.includes('NO-GI') || label.includes('NOGI') || label === 'N') weeksMap.get(weekId)?.add('N');
            }
        });

        // Calculate Stats
        const now = new Date();
        let start = new Date(studentStartDate + 'T12:00:00');

        // Safety check for invalid date string
        if (isNaN(start.getTime())) {
            console.error('TrainingHistory: Invalid studentStartDate:', studentStartDate);
            start = new Date();
            start.setMonth(start.getMonth() - 1); // Fallback to 1 month ago
        }

        const totalClasses = attendanceData.filter(r => isPresent(r.status)).length;

        // Count weeks with 0 training from start until now
        let lostCount = 0;
        let walkDate = new Date(start.getTime());
        // Walk back to Monday of the week including the start date
        const startDay = walkDate.getDay();
        const diffToMon = walkDate.getDate() - startDay + (startDay === 0 ? -6 : 1);
        walkDate.setDate(diffToMon);
        walkDate.setHours(12, 0, 0, 0);

        while (walkDate <= now) {
            const y = walkDate.getFullYear();
            const m = String(walkDate.getMonth() + 1).padStart(2, '0');
            const d = String(walkDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const weekId = getYearWeek(dateStr);
            if (!weeksMap.has(weekId)) {
                lostCount++;
            }
            walkDate.setDate(walkDate.getDate() + 7);
        }

        // Streak logic
        let streak = 0;
        let stars = 0;

        // Use Date Cursor starting from Today
        let cursorDate = new Date();
        cursorDate.setHours(12, 0, 0, 0);

        for (let i = 0; i < 52; i++) {
            const y = cursorDate.getFullYear();
            const m = String(cursorDate.getMonth() + 1).padStart(2, '0');
            const d = String(cursorDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const weekId = getYearWeek(dateStr);

            const classes = weeksMap.get(weekId) || new Set();

            if (classes.size > 0) {
                streak++;
                const hasA = classes.has('A');
                const hasB = classes.has('B');
                const hasN = classes.has('N');
                if (hasA && hasB && hasN) stars++;
            } else {
                if (i === 0) {
                    // Skip current week if empty
                } else {
                    break;
                }
            }
            cursorDate.setDate(cursorDate.getDate() - 7);
        }

        return { completedWeeks: totalClasses, lostWeeks: lostCount, currentStreak: streak, stars, history: [...attendanceData].reverse() };
    }, [attendanceData, studentStartDate]);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return {
            full: `${day} de ${months[date.getMonth()]}`,
            weekday: days[date.getDay()],
            year: year
        };
    };

    return (
        <div className="mb-8 relative">
            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 overflow-visible mb-8 transition-all hover:shadow-2xl relative">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-8 px-1">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic drop-shadow-sm">Histórico de Treinos</h2>
                        <div className="relative p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <InstructionBalloon
                                id="training-streak"
                                text="O Histórico de Treinos mostra sua constância. Mantenha suas 'Semanas em Ofensiva' sempre subindo!"
                                position="bottom-right"
                                className="!z-[110]"
                            />
                        </div>
                    </div>

                    {/* Main Stats: Streak Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 mb-6 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-default group">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-5xl font-black text-white mb-1 italic tracking-tighter drop-shadow-md">{stats.currentStreak}</div>
                                <div className="text-[10px] font-black text-orange-100 uppercase tracking-[0.2em] opacity-90 flex items-center gap-2">
                                    Semanas em Ofensiva {stats.stars > 0 && <span className="flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-full"><span className="text-yellow-300">★</span> {stats.stars}</span>}
                                </div>
                            </div>
                            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:rotate-12 transition-transform duration-500">
                                <Flame className="w-10 h-10 text-white fill-orange-200" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-8 -mt-8 rounded-full blur-2xl"></div>
                    </div>

                    {/* Section Labels */}
                    <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic">Semanas</span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic">Realizadas/Perdidas</span>
                    </div>

                    {/* Sub Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Realizadas</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 italic leading-none">{stats.completedWeeks}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Perdidas</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 italic leading-none">{stats.lostWeeks}</div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-8 px-1">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Performance Geral</span>
                            <span className="text-xs font-black text-blue-400 italic bg-blue-400/10 px-2 py-0.5 rounded-md">{Math.round((stats.completedWeeks / Math.max(1, stats.completedWeeks + stats.lostWeeks)) * 100)}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-200 dark:border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)] relative overflow-hidden"
                                style={{ width: `${Math.min(100, (stats.completedWeeks / Math.max(1, stats.completedWeeks + stats.lostWeeks)) * 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <div className="w-8 h-px bg-slate-100 dark:bg-slate-800"></div> Treinos Recentes
                        </h3>
                        {stats.history.length === 0 ? (
                            <div className="bg-slate-800/20 rounded-2xl py-12 px-4 text-center border-2 border-dashed border-slate-800">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Nenhum treino encontrado</p>
                            </div>
                        ) : (
                            (showAllHistory ? stats.history : stats.history.slice(0, 4)).map((record) => {
                                const dateInfo = formatDate(record.date);

                                const getFullLabel = (label: string | undefined) => {
                                    if (!label) return 'Treino Livre';
                                    const l = label.trim().toUpperCase();
                                    if (l === 'A') return 'Aula A';
                                    if (l === 'B') return 'Aula B';
                                    if (l === 'NO-GI' || l === 'NOGI') return 'No-Gi';
                                    if (l === 'LIVRE') return 'Treino Livre';
                                    return label;
                                };

                                const getStyle = (label: string | undefined, date: string) => {
                                    const l = (label || '').toLowerCase();
                                    const d = new Date(date + 'T12:00:00');
                                    const isFriday = d.getDay() === 5;

                                    if (l.includes('aula a') || l === 'a') return 'bg-blue-600 shadow-blue-900/40';
                                    if (l.includes('aula b') || l === 'b') return 'bg-purple-600 shadow-purple-900/40';
                                    if (l.includes('no-gi') || l.includes('nogi') || (!l && isFriday)) return 'bg-slate-900 shadow-slate-900/40';
                                    return 'bg-indigo-600 shadow-indigo-900/40';
                                };

                                return (
                                    <div key={record.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${getStyle(record.classLabel, record.date)} group-hover:scale-110 transition-transform`}>
                                            <span className="text-[10px] font-black text-white tracking-widest">{studentCategory || 'GB2'}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors italic">
                                                {record.weekNumber ? `Semana ${record.weekNumber} • ` : ''}{getFullLabel(record.classLabel)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{dateInfo.full}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{dateInfo.weekday}</span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                {stats.history.length > 4 && (
                    <button
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="w-full py-5 bg-slate-50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all border-t border-slate-100 dark:border-slate-800 italic"
                    >
                        {showAllHistory ? 'Ver Menos' : 'Ver Histórico Completo'}
                    </button>
                )}
            </div>
        </div>
    );
};
