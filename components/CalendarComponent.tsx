import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Trash2, Plus, X } from 'lucide-react';

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
        const s = status?.toLowerCase();
        return s === 'present' || s === 'presente' || s === 'a' || s === 'p';
    };

    const isTodayMarked = attendanceData.some(a => a.date === todayStr && isPresentStatus(a.status));

    const totalClassesInMonth = new Set(attendanceData.filter(a => {
        const d = new Date(a.date + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && isPresentStatus(a.status);
    }).map(a => a.date)).size;

    const handleDayClick = (day: number) => {
        if (!isAdmin) return;

        const record = getStatusForDay(day);

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

    const confirmDeleteAttendance = () => {
        if (!pendingDeleteDate || !onRemoveAttendance) return;
        onRemoveAttendance(pendingDeleteDate);
        setPendingDeleteDate(null);
    };

    return (
        <div ref={calendarRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3.5 relative overflow-visible transition-all flex flex-col gap-3 w-full">
            {/* Stats Header (Extra Compact) */}
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequência</h3>
                    <span className="text-[12px] font-black text-slate-900 italic">{totalClassesInMonth} Aulas</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[15%] transition-all duration-1000"></div>
                </div>
            </div>

            {/* Attendance Buttons (Smaller UI) - Only show for students or generic usage, Admin uses direct click now */}
            {!readOnly && !isAdmin && (
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={onMarkToday}
                        disabled={isTodayMarked}
                        className={`
                            flex items-center justify-center gap-1.5 py-2 rounded-xl font-black uppercase tracking-wider italic text-[9px] transition-all
                            ${isTodayMarked
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 active:scale-[0.98]'
                            }
                        `}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        {isTodayMarked ? 'TREINO CONCLUÍDO' : 'CONCLUIR HOJE'}
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => {
                                const date = prompt('Data (AAAA-MM-DD):', todayStr);
                                if (date && onMarkPast) onMarkPast(date);
                            }}
                            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter text-[8px] transition-all"
                        >
                            <Plus className="w-2 h-2" />
                            Antigo
                        </button>
                        <button
                            onClick={onClear}
                            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter text-[8px] transition-all"
                        >
                            <Clock className="w-2 h-2" />
                            Limpar
                        </button>
                    </div>
                </div>
            )}

            {/* Calendar Container (Tight Grid) */}
            <div className="bg-slate-50/30 rounded-xl p-2.5 border border-slate-100/50 relative">
                {/* Header */}
                <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <button onClick={prevMonth} className="p-0.5 hover:bg-white hover:shadow-sm rounded-md text-slate-400 transition-all">
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            <h2 className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">
                                {monthNames[currentMonth]} {currentYear}
                            </h2>
                            <button onClick={nextMonth} className="p-0.5 hover:bg-white hover:shadow-sm rounded-md text-slate-400 transition-all">
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <CalendarIcon className="w-2.5 h-2.5 text-slate-300" />
                    </div>

                    {/* Weekly Schedule Info (Only Show if NOT Admin, i.e. User Portal) */}
                    {!isAdmin && currentWeek && (
                        <div className="bg-white rounded-lg p-2 border border-slate-100 shadow-sm flex flex-col gap-1.5">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Currículo</span>
                                <span className="text-[9px] font-black text-blue-600 uppercase italic">Semana {currentWeek}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[7px] font-bold">A</div>
                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tight">Segunda e Terça</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-[7px] font-bold">B</div>
                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tight">Quarta e Quinta</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[7px] font-bold">N</div>
                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tight">Sexta (No-Gi/Defesa)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[7px] font-black text-slate-300 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid (Even more compact) */}
                <div className="grid grid-cols-7 gap-0.5">
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

                        if (isPresent) {
                            textClass = 'text-white';
                            if (record.classLabel === 'A') bgClass = 'bg-blue-600 shadow-blue-200';
                            else if (record.classLabel === 'B') bgClass = 'bg-purple-600 shadow-purple-200';
                            else if (record.classLabel === 'C') bgClass = 'bg-pink-600 shadow-pink-200';
                            else if (record.classLabel === 'N') bgClass = 'bg-slate-800 shadow-slate-400';
                            else bgClass = 'bg-orange-500 shadow-orange-200'; // Default / Fallback
                        } else if (isToday) {
                            // Current Day Cursor
                            bgClass = '';
                            textClass = 'text-blue-600 font-extrabold';
                        } else if (isPending) {
                            bgClass = 'bg-emerald-500 shadow-emerald-200';
                            textClass = 'text-white';
                        } else {
                            textClass = 'text-slate-400 hover:text-slate-600 hover:bg-slate-50';
                        }

                        return (
                            <button
                                key={`day-${day}`}
                                disabled={!isAdmin && readOnly}
                                onClick={() => handleDayClick(day)}
                                className="aspect-square flex items-center justify-center relative group disabled:cursor-default"
                            >
                                <div
                                    className={`
                                        w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold transition-all relative shadow-sm
                                        ${bgClass} ${textClass}
                                        ${isToday && !isPresent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                    `}
                                >
                                    {day}
                                </div>

                                {/* Confirmation Balloon for ADD */}
                                {isPending && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-2 whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900">
                                            <span className="font-bold">Confirmar?</span>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmAddAttendance();
                                                }}
                                                className="bg-emerald-500 p-0.5 rounded-full hover:bg-emerald-400 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingDate(null);
                                                }}
                                                className="bg-slate-700 p-0.5 rounded-full hover:bg-slate-600 cursor-pointer"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Confirmation Balloon for DELETE */}
                                {record && pendingDeleteDate === record.id && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="bg-red-600 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-2 whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-red-600">
                                            <span className="font-bold">Excluir?</span>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDeleteAttendance();
                                                }}
                                                className="bg-white p-0.5 rounded-full hover:bg-red-50 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-red-600" />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingDeleteDate(null);
                                                }}
                                                className="bg-red-800 p-0.5 rounded-full hover:bg-red-700 cursor-pointer"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Info (Tiny) */}
            {/* Legend / Info (Tiny) */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 px-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aula A</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600 shadow-sm shadow-purple-200"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aula B</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-800 shadow-sm shadow-slate-400"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No-Gi</span>
                </div>
            </div>
        </div>
    );
};
