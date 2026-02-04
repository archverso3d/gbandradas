import React, { useState } from 'react';
import { StudentProfile } from '../../services/admin';
import { User, Check, ChevronDown } from 'lucide-react';

interface StudentMuralProps {
    students: StudentProfile[];
    onSelectStudent?: (student: StudentProfile) => void;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
}

const CATEGORIES = ['MC', 'PC1', 'PC2', 'Juniors', 'GB1', 'GB2', 'GB F', 'GB K'];

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'MC': return 'bg-[#FFE4B5] text-amber-900'; // Cream/Light Yellow for Mini Campeões
        case 'PC1': return 'bg-yellow-400 text-yellow-900';
        case 'PC2': return 'bg-orange-500 text-white';
        case 'Juniors': return 'bg-green-600 text-white';
        case 'GB1': return 'bg-blue-600 text-white';
        case 'GB2': return 'bg-purple-600 text-white';
        case 'GB F': return 'bg-pink-500 text-white';
        case 'GB K': return 'bg-green-600 text-white';
        default: return 'bg-slate-900 text-white';
    }
};


const GB_K_SUBTYPES = ['MC', 'PC1', 'PC2', 'Juniors', 'GB K'];
const STANDALONE_CATEGORIES = ['GB1', 'GB2', 'GB F'];

export const StudentMural: React.FC<StudentMuralProps> = ({
    students,
    onSelectStudent,
    selectedIds = [],
    onToggleSelect
}) => {
    const [expandedSections, setExpandedSections] = useState({ kids: false, adults: false });

    // Helper to filter students by multiple categories
    const getStudentsByCategories = (categories: string[]) => {
        return students.filter(s => s.student_category && categories.includes(s.student_category));
    };

    const toggleSection = (section: 'kids' | 'adults') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const groupedStudents = [...GB_K_SUBTYPES, ...STANDALONE_CATEGORIES].reduce((acc, cat) => {
        acc[cat] = students.filter(s => s.student_category === cat);
        return acc;
    }, {} as Record<string, StudentProfile[]>);

    const uncategorized = students.filter(s =>
        !s.student_category ||
        (!GB_K_SUBTYPES.includes(s.student_category) && !STANDALONE_CATEGORIES.includes(s.student_category))
    );

    const renderCategorySection = (category: string) => {
        const categoryStudents = groupedStudents[category] || [];

        // Hide Legacy GB K if empty, but show others even if empty
        if (category === 'GB K' && categoryStudents.length === 0) return null;

        return (
            <div key={category}>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`${getCategoryColor(category)} px-3 py-1.5 rounded-lg transform -rotate-2`}>
                        <span className="text-white font-black text-sm italic">{category}</span>
                    </div>
                    <div className="h-px flex-grow bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{categoryStudents.length} Membros</span>
                </div>

                {categoryStudents.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {categoryStudents.map((student) => (
                            <MuralCard
                                key={student.user_id}
                                student={student}
                                onClick={() => onSelectStudent?.(student)}
                                isSelected={selectedIds.includes(student.user_id)}
                                onToggleSelect={() => onToggleSelect?.(student.user_id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl py-8 text-center">
                        <p className="text-slate-400 text-xs font-medium italic">Nenhum aluno nesta categoria</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-12 pb-10">
            {/* Summary Stat */}
            <div className="flex gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-6 py-4 flex-grow">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total de Alunos</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100 italic">{students.length}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl px-6 py-4 flex-grow">
                    <p className="text-[10px] font-black text-red-400 dark:text-red-400 uppercase tracking-widest mb-1">Novos (Sem Categoria)</p>
                    <p className="text-2xl font-black text-red-600 dark:text-red-500 italic">{uncategorized.length}</p>
                </div>
            </div>

            {/* Uncategorized (Prioritized) */}
            {uncategorized.length > 0 && (
                <div className="bg-red-50/30 dark:bg-red-900/10 rounded-[2.5rem] p-6 border border-red-100/50 dark:border-red-900/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-red-600 px-3 py-1.5 rounded-lg transform -rotate-1 shadow-md shadow-red-100">
                            <h3 className="text-white font-black text-xs italic uppercase tracking-tighter">Novos Alunos (Pendente)</h3>
                        </div>
                        <div className="h-px flex-grow bg-red-100"></div>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Aguardando definição</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uncategorized.map((student) => (
                            <MuralCard
                                key={student.user_id}
                                student={student}
                                onClick={() => onSelectStudent?.(student)}
                                isSelected={selectedIds.includes(student.user_id)}
                                onToggleSelect={() => onToggleSelect?.(student.user_id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* GB K Group Section */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => toggleSection('kids')}
                    className="w-full flex items-center justify-between group mb-8 focus:outline-none"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center transform -rotate-3 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-xl italic tracking-tighter">GB<span className="text-green-500">K</span></span>
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tighter group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Programa Kids</h2>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {getStudentsByCategories(GB_K_SUBTYPES).length} Alunos Matriculados
                            </p>
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedSections.kids ? 'bg-red-600 rotate-180' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                        <ChevronDown className={`w-5 h-5 ${expandedSections.kids ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                </button>

                <div className={`space-y-10 transition-all duration-500 overflow-hidden ${expandedSections.kids ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                    {GB_K_SUBTYPES.map(subtype => renderCategorySection(subtype))}
                </div>
            </div>

            {/* Standalone Categories (GB1, GB2, GB F) */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => toggleSection('adults')}
                    className="w-full flex items-center justify-between group mb-8 focus:outline-none"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center transform -rotate-3 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-xl italic tracking-tighter">GB</span>
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tighter group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Programas de Adultos</h2>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {getStudentsByCategories(STANDALONE_CATEGORIES).length} Alunos Matriculados
                            </p>
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedSections.adults ? 'bg-red-600 rotate-180' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                        <ChevronDown className={`w-5 h-5 ${expandedSections.adults ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                </button>
                <div className={`space-y-10 transition-all duration-500 overflow-hidden ${expandedSections.adults ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                    {STANDALONE_CATEGORIES.map(category => renderCategorySection(category))}
                </div>
            </div>
        </div>
    );
};

const MuralCard: React.FC<{
    student: StudentProfile,
    onClick?: () => void,
    isSelected?: boolean,
    onToggleSelect?: () => void
}> = ({ student, onClick, isSelected, onToggleSelect }) => {
    const beltColorClass = student.current_belt.toLowerCase().includes('blue') ? 'bg-blue-600' :
        student.current_belt.toLowerCase().includes('purple') ? 'bg-purple-600' :
            student.current_belt.toLowerCase().includes('brown') ? 'bg-amber-800' :
                student.current_belt.toLowerCase().includes('black') ? 'bg-slate-900' :
                    student.current_belt.toLowerCase().includes('gray') ? 'bg-slate-400' :
                        student.current_belt.toLowerCase().includes('yellow') ? 'bg-yellow-400' :
                            student.current_belt.toLowerCase().includes('orange') ? 'bg-orange-500' :
                                student.current_belt.toLowerCase().includes('green') ? 'bg-green-600' :
                                    'bg-slate-200';

    return (
        <div className={`relative group transition-all duration-300 ${isSelected ? 'transform scale-95' : ''}`}>
            {/* Selection Checkbox - Top Right Overlay */}
            <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.();
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'bg-red-600 border-red-600 shadow-md scale-110'
                        : 'bg-white/80 border-slate-200 hover:border-red-400 opacity-0 group-hover:opacity-100'
                        }`}
                >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                </button>
            </div>

            <button
                onClick={onClick}
                className={`w-full text-left bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border transition-all duration-300 ${isSelected
                    ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30 shadow-red-100 dark:shadow-none'
                    : 'border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-red-100 dark:hover:border-red-900/50'
                    }`}
            >
                <div className="relative mb-3">
                    <div className={`aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden border-2 relative transition-colors ${isSelected ? 'border-red-500' : 'border-slate-50 dark:border-slate-800'
                        }`}>
                        {student.avatar_url ? (
                            <img src={student.avatar_url} alt="" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="flex items-center justify-center h-full opacity-10">
                                <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                        )}
                    </div>
                    {/* Degrees */}
                    <div className={`absolute -bottom-1 right-1 px-1.5 py-0.5 rounded-lg border-2 border-white shadow-sm flex gap-0.5 ${beltColorClass}`}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-0.5 h-2 rounded-full ${i < student.degrees ? 'bg-white' : 'bg-white/30'}`}></div>
                        ))}
                    </div>
                </div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tighter truncate text-[11px] mb-0.5 leading-none">
                    {student.full_name || 'Guerreiro'}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate mb-1">
                    {student.email || 'E-mail não informado'}
                </p>
                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">{student.current_belt}</p>
            </button>
        </div>
    );
};
