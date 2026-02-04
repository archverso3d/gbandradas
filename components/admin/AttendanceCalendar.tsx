import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { adminService } from '../../services/admin';
import { CalendarComponent, AttendanceRecord } from '../CalendarComponent';
import { getCurrentCurriculumWeek } from '../../utils/curriculum';

interface AttendanceCalendarProps {
    studentId: string;
    refreshTrigger?: number;
    onMarkPast?: (date: string) => void;
    studentCategory?: string | null;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
    studentId,
    refreshTrigger,
    onMarkPast,
    studentCategory
}) => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, [studentId, refreshTrigger]);

    const loadAttendance = async () => {
        try {
            const data = await adminService.getStudentAttendance(studentId);
            if (data) {
                const formatted = data.map((item: any) => {
                    const d = new Date(item.checkin_at);
                    // Standardized local date string YYYY-MM-DD
                    const localDateStr = [
                        d.getFullYear(),
                        String(d.getMonth() + 1).padStart(2, '0'),
                        String(d.getDate()).padStart(2, '0')
                    ].join('-');

                    const weekNumber = getCurrentCurriculumWeek(d);

                    return {
                        id: item.id,
                        date: localDateStr,
                        status: item.status,
                        week_number: weekNumber, // Override DB value with calculated
                        classLabel: item.class_label,
                        checkin_at: item.checkin_at // Keep original for precise sorting if needed
                    };
                });
                setAttendance(formatted);
            } else {
                setAttendance([]);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttendance = async (id: string) => {
        try {
            await adminService.removeAttendance(id);
            await loadAttendance();
        } catch (error) {
            console.error('Error removing attendance:', error);
            alert('Erro ao remover presença.');
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
                <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="h-32 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-800/50"></div>
                </div>
            </div>
        );
    }

    const handleClear = async () => {
        const today = new Date();
        const todayStr = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');

        const todayRecord = attendance.find(a => a.date === todayStr);
        if (todayRecord) {
            await handleRemoveAttendance(todayRecord.id);
        } else {
            alert('Nenhuma presença registrada hoje para remover.');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <CalendarComponent
                attendanceData={attendance}
                readOnly={false}
                isAdmin={true}
                onMarkPast={onMarkPast}
                onRemoveAttendance={(id) => handleRemoveAttendance(id)}
                onClear={handleClear}
            />
            {/* Training History List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mt-2">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.15em] italic flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Histórico de Treinos
                        </div>
                    </h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {attendance.length > 0 ? (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {/* Sort by date desc (already sorted from DB usually, but ensuring) */}
                            {[...attendance].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record: any) => {
                                const dateObj = new Date(record.date + 'T12:00:00'); // Safe mid-day to avoid timezone offset issues on display
                                const isFriday = dateObj.getDay() === 5; // 0 = Sun, 5 = Fri

                                // Determine Label: Explicit > Friday Rule > Default
                                let classType = record.class_label;
                                if (!classType && isFriday) classType = 'No-Gi';
                                if (!classType) classType = 'Treino';

                                return (
                                    <div key={record.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black border uppercase
                                                ${classType === 'No-Gi'
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : record.classLabel === 'A' || record.classLabel === 'Aula A'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : record.classLabel === 'B' || record.classLabel === 'Aula B'
                                                            ? 'bg-purple-600 text-white border-purple-600'
                                                            : 'bg-white text-slate-500 border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600'}
                                            `}>
                                                {studentCategory || (classType === 'No-Gi' ? 'NG' : 'GB')}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 uppercase">
                                                    {record.week_number ? `SEMANA ${record.week_number} - ` : ''} AULA {record.classLabel || '?'} - {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                                    {dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <button
                                                onClick={() => handleRemoveAttendance(record.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Excluir presença"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                <span className="sr-only">Excluir</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-[10px] font-bold text-slate-400 italic">Nenhum treino registrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

