import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Filter, CheckCircle2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { curriculumData } from '../../constants/curriculumData';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface TechniqueHistoryProps {
    attendanceData: AttendanceRecord[];
    studentCategory?: string;
}

export const TechniqueHistory: React.FC<TechniqueHistoryProps> = ({ attendanceData, studentCategory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState<'ALL' | 'GB1' | 'GB2'>('ALL');

    const isPresent = (status: string | undefined) => {
        if (!status) return false;
        const s = status.toLowerCase();
        return s === 'present' || s === 'presente' || s === 'a' || s === 'b' || s === 'n' || s === 'p';
    };

    const getYearWeek = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
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

    const learnedTechniques = useMemo(() => {
        const presentRecords = attendanceData.filter(r => isPresent(r.status));
        const learned = new Set<string>();

        presentRecords.forEach(record => {
            const weekId = getYearWeek(record.date);
            const [year, weekNum] = weekId.split('-').map(Number);
            const label = (record.classLabel || '').toUpperCase();

            const weekData = curriculumData.find(w => w.week === weekNum);
            if (!weekData) return;

            const extract = (items: string[], prog: string) => {
                items.forEach(item => {
                    const match = item.match(/^(\d+)\./);
                    if (match) learned.add(`${prog}_${match[1]}`);
                });
            };

            if (label.includes('A')) {
                extract(weekData.gb1.lessonA.defesaPessoal.items, 'GB1');
                extract(weekData.gb1.lessonA.jiuJitsuEsportivo.items, 'GB1');
                extract(weekData.gb2.lessonA.tecnicaQueda.items, 'GB2');
                extract(weekData.gb2.lessonA.tecnicaChao.items, 'GB2');
            }
            if (label.includes('B')) {
                extract(weekData.gb1.lessonB.defesaPessoal.items, 'GB1');
                extract(weekData.gb1.lessonB.jiuJitsuEsportivo.items, 'GB1');
                extract(weekData.gb2.lessonB.tecnicaQueda.items, 'GB2');
                extract(weekData.gb2.lessonB.tecnicaChao.items, 'GB2');
            }
        });

        const techList: any[] = [];
        curriculumData.forEach(w => {
            const collect = (items: string[], prog: string, section: string) => {
                items.forEach(item => {
                    const match = item.match(/^(\d+)\.\s*(.*)/);
                    if (match && learned.has(`${prog}_${match[1]}`)) {
                        techList.push({
                            number: match[1],
                            title: match[2],
                            program: prog,
                            section: section,
                            week: w.week
                        });
                    }
                });
            };
            collect(w.gb1.lessonA.defesaPessoal.items, 'GB1', 'Defesa Pessoal');
            collect(w.gb1.lessonA.jiuJitsuEsportivo.items, 'GB1', 'Jiu-Jitsu Esportivo');
            collect(w.gb1.lessonB.defesaPessoal.items, 'GB1', 'Defesa Pessoal');
            collect(w.gb1.lessonB.jiuJitsuEsportivo.items, 'GB1', 'Jiu-Jitsu Esportivo');
            collect(w.gb2.lessonA.tecnicaQueda.items, 'GB2', 'Queda');
            collect(w.gb2.lessonA.tecnicaChao.items, 'GB2', 'Chão');
            collect(w.gb2.lessonB.tecnicaQueda.items, 'GB2', 'Queda');
            collect(w.gb2.lessonB.tecnicaChao.items, 'GB2', 'Chão');
        });

        return techList;
    }, [attendanceData]);

    const filteredTechniques = learnedTechniques.filter(tech => {
        const matchesSearch = tech.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="mb-8 relative">
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-800/50 overflow-hidden transition-all hover:shadow-2xl relative">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic drop-shadow-sm">Histórico de Técnicas</h2>
                        <div className="relative p-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <InstructionBalloon
                                id="technique-history"
                                text="Aqui você vê todas as técnicas que já aprendeu baseadas na sua frequência."
                                position="bottom-right"
                                className="!z-[110]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex-1 min-h-[100px] bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Currículo GB1</span>
                                <Award className="w-5 h-5 opacity-50" />
                            </div>
                            <div className="text-3xl font-black italic mt-2">{stats.totalGB1} / 96</div>
                        </div>
                        <div className="flex-1 min-h-[100px] bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Currículo GB2</span>
                                <Award className="w-5 h-5 opacity-50" />
                            </div>
                            <div className="text-3xl font-black italic mt-2">{stats.totalGB2} / 96</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar técnica ou posição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-slate-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['ALL', 'GB1', 'GB2'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterProgram(p)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterProgram === p
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTechniques.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-xs italic font-medium">
                                Nenhuma técnica encontrada para os filtros aplicados
                            </div>
                        ) : (
                            filteredTechniques.map((tech, idx) => (
                                <div key={`${tech.program}-${tech.number}-${idx}`} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-md transition-all group">
                                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white shadow-md transition-all group-hover:scale-110 ${tech.program === 'GB1' ? 'bg-blue-600 ring-2 ring-blue-500/20' : 'bg-purple-700 ring-2 ring-purple-500/20'}`}>
                                        {tech.number}
                                    </div>
                                    <div className="flex-grow min-w-0 pt-1">
                                        <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic leading-snug whitespace-normal break-words">
                                            {tech.title}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Semana {tech.week}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{tech.section}</span>
                                        </div>
                                    </div>
                                    <div className="pt-1">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
