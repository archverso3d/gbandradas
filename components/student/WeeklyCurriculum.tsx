import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, Shield, Swords, Target, BookOpen, UserCheck, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { curriculumData } from '../../constants/curriculumData';
import { getCurrentCurriculumWeek } from '../../utils/curriculum';
import { VideoModal } from './VideoModal';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface WeeklyCurriculumProps {
    currentBelt: string;
    defaultWeek?: number;
    techniqueLinks?: Record<string, string>;
}

export const WeeklyCurriculum: React.FC<WeeklyCurriculumProps> = ({ currentBelt, defaultWeek, techniqueLinks = {} }) => {
    const [selectedWeek, setSelectedWeek] = useState(defaultWeek || getCurrentCurriculumWeek());
    const [isExpanded, setIsExpanded] = useState(false);
    const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);

    // Sync with defaultWeek if it changes
    React.useEffect(() => {
        if (defaultWeek) {
            setSelectedWeek(defaultWeek);
        }
    }, [defaultWeek]);

    const [program, setProgram] = useState<'gb1' | 'gb2'>('gb1');

    const weekData = curriculumData.find(w => w.week === selectedWeek) || curriculumData[0];

    const isEligibleForGB2 = () => {
        const belt = currentBelt.toLowerCase();
        if (belt.includes('branca')) {
            const degreeMatch = belt.match(/(\d+)\s*º\s*grau/);
            if (degreeMatch) {
                const degrees = parseInt(degreeMatch[1]);
                return degrees >= 3;
            }
            return false;
        }
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

    const handleTechniqueClick = (item: string) => {
        const match = item.match(/^(\d+)\./);
        if (match) {
            const techKey = `${program}_${match[1]}`;
            const link = techniqueLinks[techKey];
            if (link) {
                setVideoModal({ url: link, title: item });
            }
        }
    };

    // Find first technique with a video link for the tour balloon
    const getFirstVideoTech = () => {
        for (const lesson of [weekData[program].lessonA, weekData[program].lessonB]) {
            const sections = [
                (lesson as any).defesaPessoal,
                (lesson as any).jiuJitsuEsportivo,
                (lesson as any).treinoEducativo,
                (lesson as any).tecnicaQueda,
                (lesson as any).tecnicaChao
            ].filter(Boolean);

            for (const section of sections) {
                for (const item of section.items) {
                    const match = item.match(/^(\d+)\./);
                    if (match && techniqueLinks[`${program}_${match[1]}`]) {
                        return item;
                    }
                }
            }
        }
        return null;
    };

    const firstVideoTech = getFirstVideoTech();

    const themeColor = program === 'gb1' ? 'bg-blue-600' : 'bg-purple-700';
    const textColor = program === 'gb1' ? 'text-blue-600' : 'text-purple-700';

    return (
        <div className="relative mb-8">
            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl relative">
                {/* Header / Week Selector */}
                <div className={`p-4 sm:p-5 text-white cursor-pointer select-none relative group ${isExpanded ? 'rounded-t-[28px]' : 'rounded-[28px]'}`} onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={`absolute inset-0 ${themeColor} transition-colors duration-500 ${isExpanded ? 'rounded-t-[28px]' : 'rounded-[28px]'}`}></div>
                    <div className={`absolute inset-x-0 bottom-0 h-1.5 bg-black/20 ${!isExpanded ? 'rounded-b-[28px]' : ''}`}></div>

                    <div className="flex items-center justify-between max-w-5xl mx-auto relative z-10 w-full gap-1 sm:gap-4 px-1 sm:px-2">
                        {/* 1. Shield Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>

                        {/* Center Navigation Group */}
                        <div className="flex items-center justify-center gap-1 sm:gap-6 flex-1 min-w-0">
                            {/* Previous Week Button */}
                            <button
                                onClick={handlePrevWeek}
                                className="w-9 h-9 sm:w-11 sm:h-11 flex justify-center items-center bg-white/10 backdrop-blur-md rounded-2xl transition-all hover:bg-white/20 active:translate-y-0.5 active:shadow-none border border-white/30 flex-shrink-0 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] group/prev"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover/prev:-translate-x-0.5 transition-transform" />
                            </button>

                            {/* Center Text */}
                            <div className="text-center min-w-0 px-2 sm:px-4">
                                <h2 className="text-base sm:text-3xl font-black uppercase italic tracking-tighter leading-none whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                    Semana {selectedWeek}
                                </h2>
                                <p className="text-[7px] sm:text-[11px] font-black opacity-90 uppercase tracking-[0.1em] sm:tracking-[0.3em] mt-0.5 sm:mt-1.5 italic whitespace-nowrap overflow-hidden text-ellipsis">
                                    Currículo Semanal
                                </p>
                            </div>

                            {/* Next Week Button */}
                            <button
                                onClick={handleNextWeek}
                                className="w-9 h-9 sm:w-11 sm:h-11 flex justify-center items-center bg-white/10 backdrop-blur-md rounded-2xl transition-all hover:bg-white/20 active:translate-y-0.5 active:shadow-none border border-white/30 flex-shrink-0 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] group/next"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/next:translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        {/* 5. Expand Button */}
                        <div className="flex-shrink-0 relative">
                            <button
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl transition-all hover:bg-white/20 active:translate-y-0.5 border border-white/30 shadow-[0_4px_0_0_rgba(0,0,0,0.2)]"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                            >
                                {isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
                                <InstructionBalloon
                                    id="curriculum-expand"
                                    text="Clique aqui para expandir o programa semanal e acompanhar as técnicas."
                                    position="bottom-right"
                                    className="!z-[110]"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsible Content */}
                <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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

                    <div className="p-6 sm:p-10 bg-white dark:bg-[#0F172A] rounded-b-[28px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 relative">
                            <div className={`hidden lg:block absolute left-1/2 top-4 bottom-4 w-px ${program === 'gb1' ? 'bg-blue-500' : 'bg-purple-500'} opacity-20 -translate-x-1/2`}></div>

                            {/* Lesson A */}
                            <div className="space-y-10">
                                <h3 className={`text-3xl font-black uppercase italic tracking-tight ${textColor} bg-slate-50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border-l-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'} drop-shadow-sm`}>AULA A</h3>
                                {program === 'gb1' ? (
                                    <>
                                        <Section icon={<Shield className="w-5 h-5" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonA.defesaPessoal.title} items={weekData.gb1.lessonA.defesaPessoal.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<Swords className="w-5 h-5" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonA.jiuJitsuEsportivo.title} items={weekData.gb1.lessonA.jiuJitsuEsportivo.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<BookOpen className="w-5 h-5" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonA.treinoEducativo.title} items={weekData.gb1.lessonA.treinoEducativo.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                                            <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonA.treinoEspecifico} theme={program} />
                                            <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonA.topicos} theme={program} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Section icon={<Target className="w-5 h-5" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonA.tecnicaQueda.title} items={weekData.gb2.lessonA.tecnicaQueda.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<UserCheck className="w-5 h-5" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonA.tecnicaChao.title} items={weekData.gb2.lessonA.tecnicaChao.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <div className="pt-6 border-t border-slate-800">
                                            <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb2.lessonA.treinoEspecifico} theme={program} />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Lesson B */}
                            <div className="space-y-10">
                                <h3 className={`text-3xl font-black uppercase italic tracking-tight ${textColor} bg-slate-50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border-l-4 ${program === 'gb1' ? 'border-blue-600' : 'border-purple-700'} drop-shadow-sm`}>AULA B</h3>
                                {program === 'gb1' ? (
                                    <>
                                        <Section icon={<Shield className="w-5 h-5" />} title="DEFESA PESSOAL" subtitle={weekData.gb1.lessonB.defesaPessoal.title} items={weekData.gb1.lessonB.defesaPessoal.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<Swords className="w-5 h-5" />} title="JIU-JITSU ESPORTIVO" subtitle={weekData.gb1.lessonB.jiuJitsuEsportivo.title} items={weekData.gb1.lessonB.jiuJitsuEsportivo.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<BookOpen className="w-5 h-5" />} title="TREINO EDUCATIVO GB1" subtitle={weekData.gb1.lessonB.treinoEducativo.title} items={weekData.gb1.lessonB.treinoEducativo.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                                            <FooterItems title="TREINO ESPECÍFICO" value={weekData.gb1.lessonB.treinoEspecifico} theme={program} />
                                            <FooterItems title="TÓPICOS GB1" value={weekData.gb1.lessonB.topicos} theme={program} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Section icon={<Target className="w-5 h-5" />} title="TÉCNICA DE QUEDA" subtitle={weekData.gb2.lessonB.tecnicaQueda.title} items={weekData.gb2.lessonB.tecnicaQueda.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
                                        <Section icon={<UserCheck className="w-5 h-5" />} title="TÉCNICA DE CHÃO" subtitle={weekData.gb2.lessonB.tecnicaChao.title} items={weekData.gb2.lessonB.tecnicaChao.items} theme={program} techniqueLinks={techniqueLinks} onTechniqueClick={handleTechniqueClick} tourTargetItem={firstVideoTech} />
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

            {/* Video Modal */}
            {videoModal && (
                <VideoModal
                    isOpen={!!videoModal}
                    onClose={() => setVideoModal(null)}
                    url={videoModal.url}
                    title={videoModal.title}
                />
            )}
        </div>
    );
};

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    items: string[];
    theme: 'gb1' | 'gb2';
    techniqueLinks?: Record<string, string>;
    onTechniqueClick?: (item: string) => void;
    tourTargetItem?: string | null;
}

const Section: React.FC<SectionProps> = ({ icon, title, subtitle, items, theme, techniqueLinks = {}, onTechniqueClick, tourTargetItem }) => {
    const textColor = theme === 'gb1' ? 'text-blue-600' : 'text-purple-700';

    const getTechniqueNumber = (item: string): string | null => {
        const match = item.match(/^(\d+)\./);
        return match ? match[1] : null;
    };

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
                    {items.map((item, idx) => {
                        const techNum = getTechniqueNumber(item);
                        const techKey = techNum ? `${theme}_${techNum}` : null;
                        const hasLink = techKey ? !!techniqueLinks[techKey] : false;

                        if (hasLink && onTechniqueClick) {
                            return (
                                <li key={idx} className="relative">
                                    {tourTargetItem === item && (
                                        <InstructionBalloon
                                            id="technique-video-link"
                                            text="Assista ao vídeo desta técnica clicando nela!"
                                            position="top-left"
                                            className="!z-[110]"
                                        />
                                    )}
                                    <button
                                        onClick={() => onTechniqueClick(item)}
                                        title="Clique para ver o vídeo"
                                        className={`w-full text-left text-xs font-medium leading-relaxed pl-3 border-l-2 py-1.5 rounded-r-lg transition-all group/tech flex items-center gap-2 ${theme === 'gb1'
                                            ? 'border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                                            : 'border-purple-400 dark:border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                                            }`}
                                    >
                                        <Play className={`w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover/tech:opacity-100 transition-opacity ${theme === 'gb1' ? 'text-blue-500' : 'text-purple-500'}`} />
                                        <span className="flex-1">{item}</span>
                                    </button>
                                </li>
                            );
                        }

                        return (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed pl-3 border-l-2 border-slate-100 dark:border-slate-800">
                                {item}
                            </li>
                        );
                    })}
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
