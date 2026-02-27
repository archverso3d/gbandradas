import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Trash2, Plus, X, Layers } from 'lucide-react';
import { InstructionBalloon } from './ui/InstructionBalloon';

export interface AttendanceRecord {
    id: string;
    date: string; // ISO date YYYY-MM-DD
    status: string; // usually 'present'
    classLabel?: string; // e.g., 'A', 'B', 'C', 'N'
}

interface CalendarComponentProps {
    attendanceData: AttendanceRecord[];
    onMarkToday?: () => void;
    onMarkPast?: (date: string) => void;
    onRemoveAttendance?: (id: string) => void;
    onClear?: () => void;
    readOnly?: boolean;
    isAdmin?: boolean;
    selectedDate?: Date | null;
    onSelectDate?: (date: Date | null) => void;
    currentWeek?: number;
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({
    attendanceData,
    onMarkToday,
    onMarkPast,
    onRemoveAttendance,
    onClear,
    readOnly = false,
    isAdmin = false,
    selectedDate,
    onSelectDate,
    currentWeek
}) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [viewDate, setViewDate] = useState(new Date());

    // New state for confirmation balloon
    const [pendingDate, setPendingDate] = useState<Date | null>(null);
    const [pendingDeleteDate, setPendingDeleteDate] = useState<string | null>(null);
    const [isGuideDismissed, setIsGuideDismissed] = useState(false);

    // Multi-day batch mode
    const [batchMode, setBatchMode] = useState(false);
    const [batchMarked, setBatchMarked] = useState<string[]>([]);

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    // Close balloon on outside click
    const calendarRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setPendingDate(null);
                setPendingDeleteDate(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStatusForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return attendanceData.find(record => record.date === dateStr);
    };

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const nextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
        setPendingDate(null);
        setPendingDeleteDate(null);
    };

    const prevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
        setPendingDate(null);
        setPendingDeleteDate(null);
    };

    // Helper to check if a record counts as presence
    const isPresentStatus = (status: string) => {
        if (!status) return false;
        const s = status.toLowerCase().trim();
        return ['present', 'presente', 'a', 'b', 'n', 'p', 'confirmed', 'checkin'].includes(s);
    };

    const isTodayMarked = attendanceData.some(a => a.date === todayStr && isPresentStatus(a.status));

    const totalClassesInMonth = new Set(attendanceData.filter(a => {
        const d = new Date(a.date + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && isPresentStatus(a.status);
    }).map(a => a.date)).size;

    const hasRecordedAttendance = attendanceData.some(a => isPresentStatus(a.status));
    const isStudentNotAdmin = !readOnly && !isAdmin;

    const handleDayClick = (day: number) => {
        if (readOnly) return;

        const record = getStatusForDay(day);

        // Batch mode: click directly marks/skips present days
        if (batchMode) {
            if (!record || !isPresentStatus(record.status)) {
                const d = new Date(currentYear, currentMonth, day);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (onMarkPast && !batchMarked.includes(dateStr)) {
                    setBatchMarked(prev => [...prev, dateStr]);
                    onMarkPast(dateStr);
                }
            }
            return;
        }

        if (record && isPresentStatus(record.status)) {
            // Already present -> Show Delete Balloon
            if (onRemoveAttendance) {
                setPendingDeleteDate(record.id);
                setPendingDate(null); // Close add balloon if open
            }
        } else {
            // Not present -> Show Add Balloon
            const d = new Date(currentYear, currentMonth, day);
            setPendingDate(d);
            setPendingDeleteDate(null); // Close delete balloon if open
        }
    };

    const confirmAddAttendance = () => {
        if (!pendingDate || !onMarkPast) return;
        const dateStr = `${pendingDate.getFullYear()}-${String(pendingDate.getMonth() + 1).padStart(2, '0')}-${String(pendingDate.getDate()).padStart(2, '0')}`;
        onMarkPast(dateStr);
        setPendingDate(null);
    };

    const toggleBatchMode = () => {
        setBatchMode(prev => {
            if (prev) setBatchMarked([]); // reset on exit
            return !prev;
        });
        setPendingDate(null);
        setPendingDeleteDate(null);
    };

    const confirmDeleteAttendance = () => {
        if (!pendingDeleteDate || !onRemoveAttendance) return;
        onRemoveAttendance(pendingDeleteDate);
        setPendingDeleteDate(null);
    };

    return (
        <div ref={calendarRef} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border-x-4 border-t-4 border-b-[8px] border-slate-100 dark:border-slate-800 p-6 relative overflow-visible transition-all flex flex-col gap-6 w-full">
            {/* Stats Header (Extra Compact) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sua Frequência</h3>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 italic">{totalClassesInMonth} Aulas</span>
                </div>
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-b-2 border-slate-200 dark:border-slate-950">
                    <div className="h-full bg-orange-500 w-[15%] transition-all duration-1000 shadow-[0_0_12px_rgba(249,115,22,0.5)] rounded-full"></div>
                </div>
            </div>

            {/* Calendar Container (Tight Grid) */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[1.5rem] p-5 border-x-2 border-t-2 border-b-4 border-slate-100 dark:border-slate-800 relative transition-colors shadow-inner">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={prevMonth}
                                className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-b-4 border-slate-200 dark:border-slate-900 active:border-b-0 active:translate-y-1 rounded-xl text-slate-400 dark:text-slate-300 transition-all font-black"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider italic">
                                {monthNames[currentMonth]} {currentYear}
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-b-4 border-slate-200 dark:border-slate-900 active:border-b-0 active:translate-y-1 rounded-xl text-slate-400 dark:text-slate-300 transition-all font-black"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Weekly Schedule Info (Only Show if NOT Admin, i.e. User Portal) */}
                    {!isAdmin && currentWeek && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-x-2 border-t-2 border-b-4 border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3 transition-colors">
                            <div className="flex items-center justify-between border-b-2 border-slate-50 dark:border-slate-700 pb-2">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Currículo</span>
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase italic bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">Semana {currentWeek}</span>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black border-b-2 border-blue-800 shadow-sm">A</div>
                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Segunda e Terça</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-black border-b-2 border-purple-800 shadow-sm">B</div>
                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Quarta e Quinta</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px] font-black border-b-2 border-red-800 shadow-sm">N</div>
                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Sexta (No-Gi/Defesa)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid (Even more compact) */}
                <div className="relative">
                    <InstructionBalloon
                        id="calendar-past-days"
                        text="Toque nos dias para registrar treinos passados."
                        position="top-right"
                    />
                    <div className="grid grid-cols-7 gap-2 relative z-0">
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="aspect-square"></div>
                        ))}

                        {days.map(day => {
                            const record = getStatusForDay(day);
                            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            const isPresent = record && isPresentStatus(record.status);
                            const isPending = pendingDate?.getDate() === day && pendingDate?.getMonth() === currentMonth;

                            let bgClass = '';
                            let textClass = '';
                            let borderClass = '';

                            if (isPresent) {
                                textClass = 'text-white';
                                if (record.classLabel === 'A') {
                                    bgClass = 'bg-blue-600 dark:bg-blue-700';
                                    borderClass = 'border-b-4 border-blue-800 dark:border-blue-900 shadow-lg shadow-blue-500/20';
                                }
                                else if (record.classLabel === 'B') {
                                    bgClass = 'bg-purple-600 dark:bg-purple-700';
                                    borderClass = 'border-b-4 border-purple-800 dark:border-purple-900 shadow-lg shadow-purple-500/20';
                                }
                                else if (record.classLabel === 'N') {
                                    bgClass = 'bg-red-600 dark:bg-red-700';
                                    borderClass = 'border-b-4 border-red-800 dark:border-red-900 shadow-lg shadow-red-500/20';
                                }
                                else {
                                    bgClass = 'bg-orange-500 dark:bg-orange-600';
                                    borderClass = 'border-b-4 border-orange-700 dark:border-orange-900 shadow-lg shadow-orange-500/20';
                                }
                            } else if (isPending) {
                                bgClass = 'bg-emerald-500';
                                textClass = 'text-white';
                                borderClass = 'border-b-4 border-emerald-700 shadow-lg shadow-emerald-500/20';
                            } else if (isToday) {
                                bgClass = 'bg-white dark:bg-slate-800';
                                textClass = 'text-blue-600 dark:text-blue-400 font-black';
                                borderClass = 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 rounded-2xl';
                            } else {
                                textClass = 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all';
                            }

                            return (
                                <button
                                    key={`day-${day}`}
                                    disabled={!isAdmin && readOnly}
                                    onClick={() => handleDayClick(day)}
                                    className={`aspect-square flex items-center justify-center relative group disabled:cursor-default transition-all active:scale-95`}
                                >
                                    <div
                                        className={`
                                        w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all relative
                                        ${bgClass} ${textClass} ${borderClass}
                                        ${!isPresent && !isPending && !isToday ? '' : ''}
                                    `}
                                    >
                                        {day}
                                    </div>

                                    {/* Confirmation Balloon for ADD */}
                                    {isPending && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in zoom-in duration-200">
                                            <div className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] py-2 px-4 rounded-xl shadow-2xl border-b-4 border-slate-950 flex items-center gap-3 whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-slate-900 dark:after:border-t-slate-800">
                                                <span className="font-black italic">CONFIRMAR?</span>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmAddAttendance();
                                                    }}
                                                    className="bg-emerald-500 p-1 rounded-full hover:bg-emerald-400 border-b-2 border-emerald-700 active:border-b-0 translate-y-0 active:translate-y-0.5 cursor-pointer transition-all"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingDate(null);
                                                    }}
                                                    className="bg-slate-700 p-1 rounded-full hover:bg-slate-600 border-b-2 border-slate-900 active:border-b-0 translate-y-0 active:translate-y-0.5 cursor-pointer transition-all"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirmation Balloon for DELETE */}
                                    {record && pendingDeleteDate === record.id && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in zoom-in duration-200">
                                            <div className="bg-red-600 text-white text-[11px] py-2 px-4 rounded-xl shadow-2xl border-b-4 border-red-800 flex items-center gap-3 whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-red-600">
                                                <span className="font-black italic text-xs">EXCLUIR TREINO?</span>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteAttendance();
                                                    }}
                                                    className="bg-white p-1 rounded-full hover:bg-red-50 border-b-2 border-red-200 active:border-b-0 translate-y-0 active:translate-y-0.5 cursor-pointer transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingDeleteDate(null);
                                                    }}
                                                    className="bg-red-800 p-1 rounded-full hover:bg-red-700 border-b-2 border-red-950 active:border-b-0 translate-y-0 active:translate-y-0.5 cursor-pointer transition-all"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Attendance Buttons (Smaller UI) - Moved to bottom and redesigned */}
            {!readOnly && !isAdmin && (
                <div className="flex flex-col gap-3 mt-4 relative">
                    <InstructionBalloon
                        id="calendar-mark-today"
                        text="Marque sua presença de hoje aqui!"
                        position="top-right"
                    />

                    {/* Batch Mode Toggle Button */}
                    <button
                        onClick={toggleBatchMode}
                        className={`
                            flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black uppercase tracking-[0.15em] italic text-sm transition-all
                            ${batchMode
                                ? 'bg-amber-500 hover:bg-amber-400 text-white border-b-[6px] border-amber-700 active:border-b-0 active:translate-y-1.5 shadow-lg shadow-amber-500/20 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border-x-2 border-t-2 border-b-4 border-slate-200 dark:border-slate-900'
                            }
                        `}
                    >
                        <Layers className="w-4 h-4" />
                        {batchMode ? `Registrando... (${batchMarked.length} dia${batchMarked.length !== 1 ? 's' : ''})` : 'Registrar Vários Treinos'}
                    </button>

                    {/* Main: Concluir Hoje / Concluir (batch) */}
                    <button
                        onClick={(e) => {
                            if (batchMode) {
                                toggleBatchMode();
                            } else if (onMarkToday) {
                                onMarkToday();
                            }
                        }}
                        disabled={!batchMode && isTodayMarked}
                        className={`
                            flex items-center justify-center gap-3 py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em] italic text-sm transition-all shadow-lg
                            ${batchMode
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-[6px] border-emerald-700 active:border-b-0 active:translate-y-1.5 shadow-emerald-500/20'
                                : isTodayMarked
                                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed border-x-2 border-t-2 border-b-4 border-slate-100 dark:border-slate-800 shadow-none'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-[6px] border-emerald-700 active:border-b-0 active:translate-y-1.5 shadow-emerald-500/20'
                            }
                        `}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {batchMode ? 'CONCLUIR' : isTodayMarked ? 'TREINO CONCLUÍDO' : 'CONCLUIR HOJE'}
                    </button>
                </div>
            )}

            {/* Legend / Info (Tiny) */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-2 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-blue-600 border-b-2 border-blue-800 shadow-sm"></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Aula A</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-purple-600 border-b-2 border-purple-800 shadow-sm"></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Aula B</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-red-600 border-b-2 border-red-800 shadow-sm"></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">No-Gi</span>
                </div>
            </div>
            {/* Beginner Instruction Footer */}
            {!readOnly && !isAdmin && !hasRecordedAttendance && (
                <div className="mt-2 text-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] leading-relaxed">
                        <span className="text-blue-500 dark:text-blue-400">Dica:</span> Toque em qualquer dia no calendário para registrar ou remover presenças.
                    </p>
                </div>
            )}
        </div>
    );
};
