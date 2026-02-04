import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, Shield, Swords, Target, BookOpen, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { curriculumData, WeeklyProgram } from '../../constants/curriculumData';
import { getCurrentCurriculumWeek } from '../../utils/curriculum';

interface WeeklyCurriculumProps {
    currentBelt: string;
    defaultWeek?: number;
}

export const WeeklyCurriculum: React.FC<WeeklyCurriculumProps> = ({ currentBelt, defaultWeek }) => {
    const [selectedWeek, setSelectedWeek] = useState(defaultWeek || getCurrentCurriculumWeek());
    const [isExpanded, setIsExpanded] = useState(false);

    // Sync with defaultWeek if it changes (e.g., loaded from admin settings)
    React.useEffect(() => {
        if (defaultWeek) {
            setSelectedWeek(defaultWeek);
        }
    }, [defaultWeek]);

    const [program, setProgram] = useState<'gb1' | 'gb2'>('gb1');

    const weekData = curriculumData.find(w => w.week === selectedWeek) || curriculumData[0];

    // Lógica de elegibilidade para GB2: Faixa Branca 3 graus ou superior
    const isEligibleForGB2 = () => {
        const belt = currentBelt.toLowerCase();
        if (belt.includes('branca')) {
            // Se for branca, verificar graus (ex: "Faixa Branca 3º Grau")
            const degreeMatch = belt.match(/(\d+)\s*º\s*grau/);
            if (degreeMatch) {
                const degrees = parseInt(degreeMatch[1]);
                return degrees >= 3;
            }
            return false;
        }
        // Se não for branca, presume-se que é superior (Azul, Roxa, etc.)
        return true;
    };

    const handlePrevWeek = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedWeek(prev => (prev > 1 ? prev - 1 : 16));
    };

    const handleNextWeek = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedWeek(prev => (prev < 16 ? prev + 1 : 1));
    };

    const themeColor = program === 'gb1' ? 'bg-blue-600' : 'bg-purple-700';
    const textColor = program === 'gb1' ? 'text-blue-600' : 'text-purple-700';
    const borderColor = program === 'gb1' ? 'border-blue-100' : 'border-purple-100';

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 overflow-hidden mb-8 transition-all hover:shadow-2xl">
            {/* Header / Week Selector */}
            <div className={`p-4 sm:p-5 text-white cursor-pointer select-none relative overflow-hidden group`} onClick={() => setIsExpanded(!isExpanded)}>
                {/* 3D layer for header */}
                <div className={`absolute inset-0 ${themeColor} transition-colors duration-500`}></div>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20"></div>

                <div className="flex items-center justify-between max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl flex-shrink-0 border border-white/20 group-hover:scale-110 transition-transform">
                            <Shield className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-5 flex-1 min-w-0">
                            <button
                                onClick={handlePrevWeek}
                                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl transition-all duo-btn-3d active:translate-y-0.5 active:shadow-none bg-white/5 border border-white/10"
                                title="Semana Anterior"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <div className="text-left min-w-0 flex flex-col items-center sm:items-start">
                                <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none whitespace-nowrap drop-shadow-md">Semana {selectedWeek}</h2>
                                <p className="text-[9px] sm:text-[10px] font-black opacity-80 uppercase tracking-[0.3em] mt-1 italic">Currículo Semanal</p>
                            </div>
                            <button
                                onClick={handleNextWeek}
                                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl transition-all duo-btn-3d active:translate-y-0.5 active:shadow-none bg-white/5 border border-white/10"
                                title="Próxima Semana"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        <div className="hidden lg:flex gap-2 mr-4">
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic border border-white/30">
                                {program === 'gb1' ? 'Programa GB1' : 'Programa GB2'}
                            </span>
                        </div>
                        <button className="p-1 sm:p-2 bg-white/10 rounded-full transition-all hover:bg-white/20">
                            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Program Switcher */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-center gap-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setProgram('gb1')}
                        className={`px-6 sm:px-10 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] italic transition-all duo-btn-3d ${program === 'gb1'
                            ? 'bg-blue-600 text-white shadow-[0_4px_0_0_#1d4ed8]'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f172a]'
                            }`}
                    >
                        GB1
                    </button>
                    <div className="relative group">
                        <button
                            onClick={() => isEligibleForGB2() && setProgram('gb2')}
                            disabled={!isEligibleForGB2()}
                            className={`px-6 sm:px-10 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] italic transition-all duo-btn-3d flex items-center gap-2 ${program === 'gb2'
                                ? 'bg-purple-700 text-white shadow-[0_4px_0_0_#581c87]'
                                : isEligibleForGB2()
                                    ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f172a]'
                                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-700 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                                }`}
                        >
                            GB2
                            {!isEligibleForGB2() && <Info className="w-3.5 h-3.5" />}
                        </button>
                        {!isEligibleForGB2() && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-3 bg-slate-800 text-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 text-center shadow-2xl border border-slate-700 ring-4 ring-black/20">
                                O Programa GB2 é exclusivo para alunos a partir do 3º grau da Faixa Branca.
                            </div>
                        )}
                    </div>
                </div>

                {/* Curriculum Body */}
                <div className="p-6 sm:p-10 bg-white dark:bg-[#0F172A]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 relative">
                        {/* Vertical Divider for Desktop */}
                        <div className={`hidden lg:block absolute left-1/2 top-4 bottom-4 w-px ${program === 'gb1' ? 'bg-blue-500' : 'bg-purple-500'} opacity-20 -translate-x-1/2`}></div>

                        {/* Lesson A */}
                        <div className="space-y-10">
                            <div className="flex flex-col items-center lg:items-start gap-4 mb-8">
                                <h3 className={`text-3xl font-black uppercase italic tracking-tight ${textColor} bg-slate-50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border-l-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'} drop-shadow-sm`}>AULA A</h3>
                            </div>

                            {program === 'gb1' ? (
                                <>
                                    <Section icon={<Shield className="w-5 h-5" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonA.defesaPessoal.title} items={weekData.gb1.lessonA.defesaPessoal.items} theme={program} />
                                    <Section icon={<Swords className="w-5 h-5" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonA.jiuJitsuEsportivo.title} items={weekData.gb1.lessonA.jiuJitsuEsportivo.items} theme={program} />
                                    <Section icon={<BookOpen className="w-5 h-5" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonA.treinoEducativo.title} items={weekData.gb1.lessonA.treinoEducativo.items} theme={program} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                                        <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonA.treinoEspecifico} theme={program} />
                                        <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonA.topicos} theme={program} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Section icon={<Target className="w-5 h-5" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonA.tecnicaQueda.title} items={weekData.gb2.lessonA.tecnicaQueda.items} theme={program} />
                                    <Section icon={<UserCheck className="w-5 h-5" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonA.tecnicaChao.title} items={weekData.gb2.lessonA.tecnicaChao.items} theme={program} />
                                    <div className="pt-6 border-t border-slate-800">
                                        <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb2.lessonA.treinoEspecifico} theme={program} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Lesson B */}
                        <div className="space-y-10">
                            <div className="flex flex-col items-center lg:items-start gap-4 mb-8">
                                <h3 className={`text-3xl font-black uppercase italic tracking-tight ${textColor} bg-slate-50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border-l-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'} drop-shadow-sm`}>AULA B</h3>
                            </div>

                            {program === 'gb1' ? (
                                <>
                                    <Section icon={<Shield className="w-5 h-5" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonB.defesaPessoal.title} items={weekData.gb1.lessonB.defesaPessoal.items} theme={program} />
                                    <Section icon={<Swords className="w-5 h-5" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonB.jiuJitsuEsportivo.title} items={weekData.gb1.lessonB.jiuJitsuEsportivo.items} theme={program} />
                                    <Section icon={<BookOpen className="w-5 h-5" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonB.treinoEducativo.title} items={weekData.gb1.lessonB.treinoEducativo.items} theme={program} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                                        <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonB.treinoEspecifico} theme={program} />
                                        <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonB.topicos} theme={program} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Section icon={<Target className="w-5 h-5" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonB.tecnicaQueda.title} items={weekData.gb2.lessonB.tecnicaQueda.items} theme={program} />
                                    <Section icon={<UserCheck className="w-5 h-5" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonB.tecnicaChao.title} items={weekData.gb2.lessonB.tecnicaChao.items} theme={program} />
                                    <div className="pt-6 border-t border-slate-800">
                                        <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb2.lessonB.treinoEspecifico} theme={program} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    items: string[];
    theme: 'gb1' | 'gb2';
}

const Section: React.FC<SectionProps> = ({ icon, title, subtitle, items, theme }) => {
    const textColor = theme === 'gb1' ? 'text-blue-600' : 'text-purple-700';
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className={`${theme === 'gb1' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'} p-1.5 rounded-lg`}>
                    {icon}
                </span>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{title}</h4>
            </div>
            <div className="pl-9">
                <p className={`text-[11px] font-bold uppercase italic tracking-wide mb-2 ${textColor}`}>{subtitle}</p>
                <ul className="space-y-1.5">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed pl-3 border-l-2 border-slate-100 dark:border-slate-800">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const FooterItems = ({ title, value, theme }: { title: string, value: string, theme: 'gb1' | 'gb2' }) => {
    const textColor = theme === 'gb1' ? 'text-blue-600' : 'text-purple-700';
    return (
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter mb-0.5">{title}</h4>
            <p className={`text-xs font-bold uppercase italic ${textColor} dark:text-slate-300`}>{value}</p>
        </div>
    );
}
