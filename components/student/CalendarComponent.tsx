import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceRecord {
    date: string; // ISO date YYYY-MM-DD
    status: 'present' | 'absent' | 'excused';
}

interface CalendarComponentProps {
    attendanceData: AttendanceRecord[];
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({ attendanceData }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

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
    };

    const prevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const totalClassesInMonth = attendanceData.filter(a => {
        const d = new Date(a.date + 'T00:00:00'); // Ensure local date parsing
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && a.status === 'present';
    }).length;

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 p-5 sm:p-6 relative overflow-hidden transition-all hover:shadow-2xl">
            {/* Header */}
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center mb-8 px-1">
                {/* Left side spacer/prev button */}
                <div className="flex justify-end pr-3 sm:pr-5">
                    <button
                        onClick={prevMonth}
                        className="p-2.5 hover:bg-slate-800 rounded-2xl transition-all duo-btn-3d active:translate-y-0.5 active:shadow-none bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Center text block */}
                <div className="flex flex-col items-center justify-center min-w-[120px] sm:min-w-[180px]">
                    <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter italic leading-none drop-shadow-md text-center">
                        {monthNames[currentMonth]}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5 italic text-center pl-[0.3em]">
                        {currentYear}
                    </p>
                </div>

                {/* Right side next button and icon container */}
                <div className="flex justify-start pl-3 sm:pl-5 relative">
                    <button
                        onClick={nextMonth}
                        className="p-2.5 hover:bg-slate-800 rounded-2xl transition-all duo-btn-3d active:translate-y-0.5 active:shadow-none bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 hover:text-white"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Absolute positioned calendar icon to not disturb centering */}
                    <div className="absolute left-[calc(100%+8px)] sm:left-[calc(100%+16px)] top-1/2 -translate-y-1/2 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hidden lg:block">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} className="aspect-square"></div>
                ))}

                {days.map(day => {
                    const record = getStatusForDay(day);
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    const isPresent = record?.status === 'present';

                    return (
                        <div key={`day-${day}`} className="aspect-square flex flex-col items-center justify-center relative group">
                            <div
                                className={`
                                    w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all relative
                                    ${isPresent
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : isToday
                                            ? 'border-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                                    }
                                `}
                            >
                                {day}
                                {isPresent && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-300 rounded-full"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Stats */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Aulas no Mês</span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100 italic leading-none mt-1">{totalClassesInMonth}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Presente</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
