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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-all duration-500">
            {/* Header / Week Selector */}
            <div className={`${themeColor} p-4 text-white cursor-pointer select-none`} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrevWeek}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Semana Anterior"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="text-left">
                                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none whitespace-nowrap">Semana {selectedWeek}</h2>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Currículo Semanal</p>
                            </div>
                            <button
                                onClick={handleNextWeek}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Próxima Semana"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-2 mr-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {program === 'gb1' ? 'Programa GB1' : 'Programa GB2'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/20 mx-2"></div>
                        <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Program Switcher */}
                <div className="bg-gray-50 border-b border-gray-100 p-2 flex justify-center gap-2">
                    <button
                        onClick={() => setProgram('gb1')}
                        className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${program === 'gb1'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Programa GB1
                    </button>
                    <div className="relative group">
                        <button
                            onClick={() => isEligibleForGB2() && setProgram('gb2')}
                            disabled={!isEligibleForGB2()}
                            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${program === 'gb2'
                                ? 'bg-purple-700 text-white shadow-md shadow-purple-200'
                                : isEligibleForGB2()
                                    ? 'bg-white text-gray-400 hover:text-gray-600'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Programa GB2
                            {!isEligibleForGB2() && <Info className="w-3.5 h-3.5" />}
                        </button>
                        {!isEligibleForGB2() && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                O Programa GB2 é exclusivo para alunos a partir do 3º grau da Faixa Branca.
                            </div>
                        )}
                    </div>
                </div>

                {/* Curriculum Body */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        {/* Vertical Divider for Desktop */}
                        <div className={`hidden md:block absolute left-1/2 top-4 bottom-4 w-px ${program === 'gb1' ? 'bg-blue-400' : 'bg-purple-400'} opacity-30 -translate-x-1/2`}></div>

                        {/* Lesson A */}
                        <div className="space-y-6">
                            <div className="text-center border-b-2 inline-block pb-1 mx-auto w-full mb-4">
                                <h3 className={`text-xl font-black uppercase italic tracking-tight ${textColor} border-b-2 inline-block px-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'}`}>AULA A</h3>
                            </div>

                            {program === 'gb1' ? (
                                <>
                                    <Section icon={<Shield className="w-4 h-4" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonA.defesaPessoal.title} items={weekData.gb1.lessonA.defesaPessoal.items} theme={program} />
                                    <Section icon={<Swords className="w-4 h-4" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonA.jiuJitsuEsportivo.title} items={weekData.gb1.lessonA.jiuJitsuEsportivo.items} theme={program} />
                                    <Section icon={<BookOpen className="w-4 h-4" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonA.treinoEducativo.title} items={weekData.gb1.lessonA.treinoEducativo.items} theme={program} />
                                    <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonA.treinoEspecifico} theme={program} />
                                    <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonA.topicos} theme={program} />
                                </>
                            ) : (
                                <>
                                    <Section icon={<Target className="w-4 h-4" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonA.tecnicaQueda.title} items={weekData.gb2.lessonA.tecnicaQueda.items} theme={program} />
                                    <Section icon={<UserCheck className="w-4 h-4" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonA.tecnicaChao.title} items={weekData.gb2.lessonA.tecnicaChao.items} theme={program} />
                                    <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb2.lessonA.treinoEspecifico} theme={program} />
                                </>
                            )}
                        </div>

                        {/* Lesson B */}
                        <div className="space-y-6">
                            <div className="text-center border-b-2 inline-block pb-1 mx-auto w-full mb-4">
                                <h3 className={`text-xl font-black uppercase italic tracking-tight ${textColor} border-b-2 inline-block px-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'}`}>AULA B</h3>
                            </div>

                            {program === 'gb1' ? (
                                <>
                                    <Section icon={<Shield className="w-4 h-4" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonB.defesaPessoal.title} items={weekData.gb1.lessonB.defesaPessoal.items} theme={program} />
                                    <Section icon={<Swords className="w-4 h-4" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonB.jiuJitsuEsportivo.title} items={weekData.gb1.lessonB.jiuJitsuEsportivo.items} theme={program} />
                                    <Section icon={<BookOpen className="w-4 h-4" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonB.treinoEducativo.title} items={weekData.gb1.lessonB.treinoEducativo.items} theme={program} />
                                    <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonB.treinoEspecifico} theme={program} />
                                    <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonB.topicos} theme={program} />
                                </>
                            ) : (
                                <>
                                    <Section icon={<Target className="w-4 h-4" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonB.tecnicaQueda.title} items={weekData.gb2.lessonB.tecnicaQueda.items} theme={program} />
                                    <Section icon={<UserCheck className="w-4 h-4" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonB.tecnicaChao.title} items={weekData.gb2.lessonB.tecnicaChao.items} theme={program} />
                                    <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb2.lessonB.treinoEspecifico} theme={program} />
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
                <span className={`${theme === 'gb1' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-700'} p-1.5 rounded-lg`}>
                    {icon}
                </span>
                <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tight">{title}</h4>
            </div>
            <div className="pl-9">
                <p className={`text-[11px] font-bold uppercase italic tracking-wide mb-2 ${textColor}`}>{subtitle}</p>
                <ul className="space-y-1.5">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 font-medium leading-relaxed pl-3 border-l-2 border-gray-100">
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
        <div className="pt-4 border-t border-gray-50">
            <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter mb-0.5">{title}</h4>
            <p className={`text-xs font-bold uppercase italic ${textColor}`}>{value}</p>
        </div>
    );
}
