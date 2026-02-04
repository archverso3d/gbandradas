import React from 'react';
import { Search, User, ChevronRight } from 'lucide-react';
import { StudentProfile } from '../../services/admin';

interface StudentSidebarProps {
    students: StudentProfile[];
    selectedStudentId?: string;
    onSelectStudent: (student: StudentProfile) => void;
    search: string;
    onSearchChange: (value: string) => void;
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
    students,
    selectedStudentId,
    onSelectStudent,
    search,
    onSearchChange,
    selectedIds,
    onToggleSelect
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[700px] transition-all">
            <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:ring-4 focus:ring-red-50/50 dark:focus:ring-red-900/30 focus:border-red-500 outline-none transition-all text-sm font-semibold tracking-tight"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {students.length > 0 ? (
                    students.map((student) => {
                        const isSelected = selectedStudentId === student.user_id;
                        return (
                            <div
                                key={student.user_id}
                                className={`w-full flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800 text-left relative ${isSelected ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                            >
                                {/* Multi-select Checkbox */}
                                <div className="pl-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(student.user_id)}
                                        onChange={() => onToggleSelect(student.user_id)}
                                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                    />
                                </div>

                                <button
                                    onClick={() => onSelectStudent(student)}
                                    className="flex-grow p-4 flex items-center gap-4 text-left"
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                                    )}

                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                                            {student.avatar_url ? (
                                                <img src={student.avatar_url} alt="" className="w-full h-full object-cover object-top" />
                                            ) : (
                                                <User className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm ${student.current_belt.toLowerCase().includes('blue') ? 'bg-blue-600' :
                                            student.current_belt.toLowerCase().includes('purple') ? 'bg-purple-600' :
                                                student.current_belt.toLowerCase().includes('brown') ? 'bg-amber-800' :
                                                    student.current_belt.toLowerCase().includes('black') ? 'bg-slate-900' :
                                                        'bg-slate-300'
                                            }`}>
                                            <span className="text-[9px] text-white font-black">{student.degrees}</span>
                                        </div>
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <p className={`font-bold text-sm truncate tracking-tight transition-colors ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                            {student.full_name || student.email?.split('@')[0] || 'Aluno'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">{student.current_belt}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'text-red-400 translate-x-1' : 'text-slate-200 dark:text-slate-700'}`} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-200 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Nenhum aluno encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};
