import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Timer,
    ChevronRight,
    RotateCcw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    BookOpen,
    Award,
    Info,
    Play
} from 'lucide-react';
import { Belt, Question, QuizState } from '../../types/quiz';
import { QUESTIONS } from '../../utils/quizQuestions';
import { adminService } from '../../services/admin';
import { supabase } from '../../services/supabaseClient';
import { Star } from 'lucide-react';

const QUIZ_TIME_LIMIT = 60 * 60; // 60 minutes
const QUESTIONS_PER_QUIZ = 20;
const PASSING_SCORE = 0.7;

interface QuizSectionProps {
    currentBelt: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ currentBelt }) => {
    const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null);
    const [quizState, setQuizState] = useState<QuizState | null>(null);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
    const [showExplanation, setShowExplanation] = useState(false);
    const [achievements, setAchievements] = useState<string[]>([]);

    useEffect(() => {
        const fetchAchievements = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('quiz_achievements')
                    .eq('user_id', user.id)
                    .single();

                if (data?.quiz_achievements) {
                    setAchievements(data.quiz_achievements);
                }
            } catch (err) {
                console.error('Error fetching quiz achievements:', err);
            }
        };

        fetchAchievements();
    }, [selectedBelt]); // Refetch when returning from a quiz


    // Map string belt to Enum
    const userBeltEnum = useMemo(() => {
        const belt = currentBelt.toLowerCase();
        if (belt.includes('azul')) return Belt.BLUE;
        if (belt.includes('roxa')) return Belt.PURPLE;
        if (belt.includes('marrom')) return Belt.BROWN;
        if (belt.includes('preta')) return Belt.BLACK;
        return null;
    }, [currentBelt]);

    const startQuiz = (belt: Belt) => {
        const filteredQuestions = QUESTIONS.filter(q => q.belts.includes(belt));
        const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, QUESTIONS_PER_QUIZ);

        setQuizState({
            currentQuestionIndex: 0,
            answers: new Array(selected.length).fill(-1),
            startTime: Date.now(),
            isFinished: false,
            questions: selected
        });
        setSelectedBelt(belt);
        setTimeLeft(QUIZ_TIME_LIMIT);
        setShowExplanation(false);
    };

    const finishQuiz = useCallback(async () => {
        if (quizState) {
            setQuizState(prev => prev ? { ...prev, isFinished: true } : null);

            const score = calculateScore();
            const percentage = score / quizState.questions.length;
            const passed = percentage >= PASSING_SCORE;

            if (passed && selectedBelt) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await adminService.saveQuizAchievement(user.id, selectedBelt);
                    }
                } catch (err) {
                    console.error('Error saving quiz achievement:', err);
                }
            }
        }
    }, [quizState, selectedBelt]);


    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (quizState && !quizState.isFinished && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        finishQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [quizState, timeLeft, finishQuiz]);

    const handleAnswer = (optionIndex: number) => {
        if (!quizState || quizState.isFinished) return;

        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQuestionIndex] = optionIndex;

        setQuizState({
            ...quizState,
            answers: newAnswers
        });
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (!quizState) return;

        if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
            setQuizState({
                ...quizState,
                currentQuestionIndex: quizState.currentQuestionIndex + 1
            });
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateScore = () => {
        if (!quizState) return 0;
        const correct = quizState.answers.reduce((acc, curr, idx) => {
            return acc + (curr === quizState.questions[idx].correctAnswer ? 1 : 0);
        }, 0);
        return correct;
    };

    const getBeltColorStyles = (belt: Belt) => {
        switch (belt) {
            case Belt.BLUE: return 'from-blue-600 to-blue-700 text-white shadow-blue-500/20';
            case Belt.PURPLE: return 'from-purple-600 to-purple-700 text-white shadow-purple-500/20';
            case Belt.BROWN: return 'from-amber-800 to-amber-900 text-white shadow-amber-900/20';
            case Belt.BLACK: return 'from-slate-800 to-slate-950 text-white shadow-black/20';
            default: return 'from-slate-400 to-slate-500 text-white';
        }
    };

    // Initial View: Selection
    if (!selectedBelt) {
        const availableBelts = [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK];

        return (
            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 p-6 flex flex-col transition-all hover:shadow-2xl overflow-hidden relative group">
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic flex items-center gap-2 drop-shadow-sm">
                            Quiz de Regras IBJJF
                        </h2>
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <Award className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium italic">
                    Teste seus conhecimentos para a próxima graduação. Prepare-se para ser um mestre nas regras!
                </p>

                <div className="grid grid-cols-1 gap-4 relative z-10">
                    {availableBelts.map((belt) => {
                        const isUserBelt = userBeltEnum === belt;
                        const hasAchievement = achievements.includes(belt);

                        return (
                            <button
                                key={belt}
                                onClick={() => startQuiz(belt)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duo-btn-3d group/btn relative overflow-hidden ${isUserBelt
                                    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30'
                                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50'
                                    } hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                {hasAchievement && (
                                    <div className="absolute top-0 right-0 p-1 bg-amber-400 text-white rounded-bl-xl shadow-sm z-20">
                                        <Star className="w-3 h-3 fill-current" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getBeltColorStyles(belt)} shadow-lg`}>
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-black italic uppercase italic tracking-wider text-sm ${isUserBelt ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                Faixa {belt.charAt(0).toUpperCase() + belt.slice(1)}
                                            </p>
                                            {hasAchievement && (
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-sm" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                            Simulado Oficial
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 group-hover/btn:translate-x-1 transition-transform`}>
                                    <Play className={`w-3.5 h-3.5 ${isUserBelt ? 'text-emerald-500' : 'text-slate-400'}`} fill="currentColor" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Decorative element */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        );
    }

    // Quiz Finished View
    if (quizState?.isFinished) {
        const score = calculateScore();
        const percentage = score / quizState.questions.length;
        const passed = percentage >= PASSING_SCORE;

        return (
            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col min-h-[400px]">
                <div className={`p-8 text-center ${passed ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'} text-white relative`}>
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    >
                        {passed ? <Trophy className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" /> : <AlertCircle className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />}
                    </motion.div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 drop-shadow-md">
                        {passed ? 'Aprovado!' : 'Tente Novamente'}
                    </h2>
                    <p className="font-bold opacity-90 uppercase tracking-widest text-[10px]">
                        Você acertou {score} de {quizState.questions.length} questões
                    </p>

                    {/* Weave pattern overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.5) 1px, transparent 0)`, backgroundSize: '4px 4px' }}></div>
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center py-4 border-b-2 border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[11px]">Porcentagem</span>
                        <span className={`text-2xl font-black italic ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>{(percentage * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b-2 border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[11px]">Tempo Restante</span>
                        <span className="text-xl font-black italic text-slate-800 dark:text-slate-100">{formatTime(timeLeft)}</span>
                    </div>

                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => startQuiz(selectedBelt)}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-2 duo-btn-3d hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <RotateCcw className="w-4 h-4" /> Refazer Simulado
                        </button>
                        <button
                            onClick={() => setSelectedBelt(null)}
                            className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-black italic uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98]"
                        >
                            Voltar ao Início
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active Quiz View
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const currentAnswer = quizState.answers[quizState.currentQuestionIndex];

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-2xl border-[3px] border-slate-200 dark:border-slate-800 flex flex-col transition-all overflow-hidden relative group min-h-[600px]">
            {/* Header */}
            <header className="bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-slate-800 p-5 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedBelt(null)}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <RotateCcw className="w-4 h-4 text-slate-400" />
                        </button>
                        <div>
                            <h2 className="font-black italic uppercase tracking-wider text-xs text-slate-800 dark:text-slate-200">Faixa {selectedBelt}</h2>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Questão {quizState.currentQuestionIndex + 1} de {quizState.questions.length}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-xs shadow-inner ${timeLeft < 300 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Timer className="w-3.5 h-3.5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full overflow-hidden shadow-inner">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${getBeltColorStyles(selectedBelt)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                    />
                </div>
            </header>

            <main className="p-6 flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quizState.currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 flex-1 flex flex-col"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                <Info className="w-3 h-3 text-emerald-500" /> {currentQuestion.module}
                            </div>
                            <h1 className="text-xl font-black italic leading-tight text-slate-900 dark:text-slate-100 tracking-tight">
                                {currentQuestion.text}
                            </h1>
                        </div>

                        <div className="grid gap-3 flex-1">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = currentAnswer === idx;
                                const isCorrect = idx === currentQuestion.correctAnswer;
                                const showResult = showExplanation;

                                let buttonClass = "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group/opt duo-btn-3d ";

                                if (!showResult) {
                                    buttonClass += isSelected
                                        ? "border-slate-800 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl"
                                        : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600";
                                } else {
                                    if (idx === currentQuestion.correctAnswer) {
                                        buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-400 shadow-emerald-500/10";
                                    } else if (isSelected) {
                                        buttonClass += "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-400 shadow-rose-500/10";
                                    } else {
                                        buttonClass += "border-slate-50 dark:border-slate-900 bg-transparent opacity-40 text-slate-400";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={showResult}
                                        onClick={() => handleAnswer(idx)}
                                        className={buttonClass}
                                    >
                                        <span className="font-bold text-sm tracking-tight">{option}</span>
                                        <AnimatePresence>
                                            {showResult && isCorrect && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </motion.div>
                                            )}
                                            {showResult && isSelected && !isCorrect && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    <XCircle className="w-5 h-5 text-rose-500" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                );
                            })}
                        </div>

                        {showExplanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/50 rounded-2xl space-y-3 border-2 border-slate-200 dark:border-slate-700/50 mt-auto"
                            >
                                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-black italic uppercase tracking-wider text-[10px]">
                                    <BookOpen className="w-4 h-4 text-emerald-500" /> Explicação da Regra
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                                    {currentQuestion.explanation}
                                </p>
                                <button
                                    onClick={nextQuestion}
                                    className="mt-4 w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black italic uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 duo-btn-3d active:scale-95 transition-all shadow-lg"
                                >
                                    {quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Finalizar Simulado' : 'Próxima Questão'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Decorative background blur */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-400/10 dark:bg-slate-800/20 rounded-full blur-3xl pointer-events-none group-hover:bg-slate-400/20 transition-all duration-700"></div>
        </div>
    );
};
