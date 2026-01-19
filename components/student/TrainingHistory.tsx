import React, { useMemo } from 'react';
import { Flame, History, CheckCircle2 } from 'lucide-react';

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
}

// Helper to get Year-Week identifier
const getYearWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = new Date(d.valueOf());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

export const TrainingHistory: React.FC<TrainingHistoryProps> = ({ attendanceData, studentStartDate }) => {

    const stats = useMemo(() => {
        if (!attendanceData) {
            return { completedWeeks: 0, lostWeeks: 0, currentStreak: 0, history: [] };
        }

        // Group attendance by week
        const weeksMap = new Map<string, number>();
        attendanceData.forEach(record => {
            if (record.status === 'present') {
                const weekId = getYearWeek(record.date);
                weeksMap.set(weekId, (weeksMap.get(weekId) || 0) + 1);
            }
        });

        // Calculate Stats
        const now = new Date();

        // Find earliest attendance to start counting lost weeks
        const presentDates = attendanceData
            .filter(r => r.status === 'present')
            .map(r => new Date(r.date).getTime());

        if (presentDates.length === 0) {
            return { completedWeeks: 0, lostWeeks: 0, currentStreak: 0, history: [] };
        }

        const start = new Date(Math.min(...presentDates));

        let completed = 0;
        let streak = 0;

        completed = Array.from(weeksMap.values()).filter(count => count >= 2).length;

        // Streak logic
        let tempStreak = 0;
        let checkDate = new Date();
        for (let i = 0; i < 52; i++) {
            const weekId = getYearWeek(checkDate.toISOString());
            const count = weeksMap.get(weekId) || 0;
            if (count >= 2) {
                tempStreak++;
            } else {
                if (i === 0) {
                    checkDate.setDate(checkDate.getDate() - 7);
                    continue;
                }
                break;
            }
            checkDate.setDate(checkDate.getDate() - 7);
        }
        streak = tempStreak;

        const totalWeeksEst = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)));
        const lost = Math.max(0, totalWeeksEst - completed);

        return { completedWeeks: completed, lostWeeks: lost, currentStreak: streak, history: [...attendanceData].reverse() };
    }, [attendanceData]);

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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <History className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Histórico de Treinos</h2>
                </div>

                {/* Main Stats: Streak Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 mb-6 shadow-lg shadow-orange-100">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-black text-white mb-1">{stats.currentStreak}</div>
                            <div className="text-[10px] font-bold text-orange-100 uppercase tracking-widest opacity-90">Semanas em Ofensiva</div>
                        </div>
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                            <Flame className="w-8 h-8 text-white fill-orange-200" />
                        </div>
                    </div>
                </div>

                {/* Sub Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Realizadas</span>
                        </div>
                        <div className="text-xl font-black text-slate-800">{stats.completedWeeks}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Perdidas</span>
                        </div>
                        <div className="text-xl font-black text-slate-800">{stats.lostWeeks}</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Geral</span>
                        <span className="text-xs font-black text-indigo-600">{Math.round((stats.completedWeeks / Math.max(1, stats.completedWeeks + stats.lostWeeks)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${Math.min(100, (stats.completedWeeks / Math.max(1, stats.completedWeeks + stats.lostWeeks)) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Treinos Recentes</h3>
                    {stats.history.length === 0 ? (
                        <div className="bg-slate-50 rounded-xl py-8 px-4 text-center border-2 border-dashed border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nenhum treino encontrado</p>
                        </div>
                    ) : (
                        stats.history.slice(0, 4).map((record) => {
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

                            const getStyle = (label: string | undefined) => {
                                const l = (label || '').toLowerCase();
                                if (l.includes('aula a') || l === 'a') return 'bg-blue-600 shadow-blue-200';
                                if (l.includes('aula b') || l === 'b') return 'bg-purple-600 shadow-purple-200';
                                if (l.includes('no-gi') || l.includes('nogi')) return 'bg-slate-900 shadow-slate-200';
                                return 'bg-indigo-600 shadow-indigo-200';
                            };

                            return (
                                <div key={record.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${getStyle(record.classLabel)}`}>
                                        <span className="text-[10px] font-black text-white tracking-widest">GB2</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                                            {record.weekNumber ? `Semana ${record.weekNumber} • ` : ''}{getFullLabel(record.classLabel)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-500">{dateInfo.full}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-[10px] font-bold text-slate-400">{dateInfo.weekday}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {stats.history.length > 4 && (
                <button className="w-full py-4 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-indigo-600 transition-all border-t border-slate-100">
                    Ver Histórico Completo
                </button>
            )}
        </div>
    );
};
