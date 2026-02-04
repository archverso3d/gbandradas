import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Filter, CheckCircle2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { curriculumData } from '../../constants/curriculumData';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface TechniqueHistoryProps {
    attendanceData: AttendanceRecord[];
    studentCategory: string; // 'GB1' or 'GB2'
}

interface LearnedTechnique {
    number: number;
    title: string;
    program: 'GB1' | 'GB2';
    week: number;
    lesson: 'A' | 'B';
    section: string;
}

export const TechniqueHistory: React.FC<TechniqueHistoryProps> = ({ attendanceData, studentCategory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState<'ALL' | 'GB1' | 'GB2'>('ALL');
    const [isExpanded, setIsExpanded] = useState(false);

    const learnedTechniques = useMemo(() => {
        const learned = new Map<string, LearnedTechnique>();
        const isGB2 = studentCategory === 'GB2';

        attendanceData.forEach(record => {
            if (record.status !== 'present' || !record.weekNumber || !record.classLabel) return;

            const weekData = curriculumData.find(w => w.week === record.weekNumber);
            if (!weekData) return;

            const lessonKey = record.classLabel.toUpperCase().trim() === 'A' ? 'lessonA' :
                record.classLabel.toUpperCase().trim() === 'B' ? 'lessonB' : null;

            if (!lessonKey) return;

            // Helper to extract number and title from string "1. Title"
            const parseTech = (techStr: string, program: 'GB1' | 'GB2', section: string): LearnedTechnique | null => {
                const match = techStr.match(/^(\d+)\.\s*(.*)/);
                if (match) {
                    return {
                        number: parseInt(match[1]),
                        title: match[2],
                        program,
                        week: record.weekNumber!,
                        lesson: lessonKey === 'lessonA' ? 'A' : 'B',
                        section
                    };
                }
                return null;
            };

            // Process GB1
            const gb1Lesson = weekData.gb1[lessonKey];
            [
                { data: gb1Lesson.defesaPessoal, section: 'Defesa Pessoal' },
                { data: gb1Lesson.jiuJitsuEsportivo, section: 'Jiu-Jitsu Esportivo' }
            ].forEach(sec => {
                sec.data.items.forEach(item => {
                    const tech = parseTech(item, 'GB1', sec.section);
                    if (tech) learned.set(`GB1-${tech.number}`, tech);
                });
            });

            // Process GB2 if eligible
            if (isGB2) {
                const gb2Lesson = weekData.gb2[lessonKey];
                [
                    { data: gb2Lesson.tecnicaQueda, section: 'Técnica de Queda' },
                    { data: gb2Lesson.tecnicaChao, section: 'Técnica de Chão' }
                ].forEach(sec => {
                    sec.data.items.forEach(item => {
                        const tech = parseTech(item, 'GB2', sec.section);
                        if (tech) learned.set(`GB2-${tech.number}`, tech);
                    });
                });
            }
        });

        return Array.from(learned.values()).sort((a, b) => {
            if (a.number !== b.number) return a.number - b.number;
            return a.program.localeCompare(b.program);
        });
    }, [attendanceData, studentCategory]);

    const filteredTechniques = learnedTechniques.filter(tech => {
        const matchesSearch = tech.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tech.number.toString().includes(searchTerm) ||
            tech.section.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProgram = filterProgram === 'ALL' || tech.program === filterProgram;
        return matchesSearch && matchesProgram;
    });

    const stats = {
        totalGB1: new Set(learnedTechniques.filter(t => t.program === 'GB1').map(t => t.number)).size,
        totalGB2: new Set(learnedTechniques.filter(t => t.program === 'GB2').map(t => t.number)).size,
        totalLearned: learnedTechniques.length
    };

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-800/50 overflow-hidden mb-8 transition-all hover:shadow-2xl">
            <div className="p-5">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic drop-shadow-sm">Histórico de Técnicas</h2>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Currículo GB1</span>
                            <Award className="w-4 h-4 opacity-50" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black italic">{stats.totalGB1}</span>
                            <span className="text-xs font-bold mb-1 opacity-70">/ 96 TÉCNICAS</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${(stats.totalGB1 / 96) * 100}%` }}
                            />
                        </div>
                    </div>

                    {studentCategory === 'GB2' && (
                        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Currículo GB2</span>
                                <Award className="w-4 h-4 opacity-50" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black italic">{stats.totalGB2}</span>
                                <span className="text-xs font-bold mb-1 opacity-70">/ 96 TÉCNICAS</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    style={{ width: `${(stats.totalGB2 / 96) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar técnica..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 uppercase tracking-wide"
                        />
                    </div>
                    {studentCategory === 'GB2' && (
                        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            {(['ALL', 'GB1', 'GB2'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setFilterProgram(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${filterProgram === p
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {p === 'ALL' ? 'TODOS' : p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Techniques List */}
                <div className={`space-y-2 transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-[400px]'}`}>
                    {filteredTechniques.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nenhuma técnica encontrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredTechniques.map((tech) => (
                                <div
                                    key={`${tech.program}-${tech.number}`}
                                    className="group flex items-center gap-4 p-3 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-xl transition-all hover:shadow-md"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${tech.program === 'GB1' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                        }`}>
                                        <span className="text-xs font-black italic">{tech.number}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${tech.program === 'GB1' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                }`}>
                                                {tech.program}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tech.section}</span>
                                        </div>
                                        <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-normal line-clamp-2 sm:line-clamp-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {tech.title}
                                        </h4>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Show More/Less */}
                {filteredTechniques.length > 5 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mt-4 py-3 bg-slate-50 dark:bg-slate-800/30 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-xl border border-slate-100 dark:border-slate-800/50 italic flex items-center justify-center gap-2"
                    >
                        {isExpanded ? (
                            <><ChevronUp className="w-3 h-3" /> Ver Menos</>
                        ) : (
                            <><ChevronDown className="w-3 h-3" /> Ver Mais Técnicas</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
