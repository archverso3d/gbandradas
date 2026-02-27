import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BookOpen,
  ShieldCheck,
  Award,
  Info
} from 'lucide-react';
import { Belt, Module, Question, QuizState } from './types';
import { QUESTIONS } from './data/questions';

const QUIZ_TIME_LIMIT = 60 * 60; // 60 minutes in seconds
const QUESTIONS_PER_QUIZ = 20;
const PASSING_SCORE = 0.7;

export default function App() {
  const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [showExplanation, setShowExplanation] = useState(false);

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

  const finishQuiz = useCallback(() => {
    if (quizState) {
      setQuizState(prev => prev ? { ...prev, isFinished: true } : null);
    }
  }, [quizState]);

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

  if (!selectedBelt) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-6 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
              IBJJF Rules Master
            </h1>
            <p className="text-zinc-500 text-lg">
              Simulado de arbitragem oficial. Teste seus conhecimentos e prepare-se para a prova.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(Belt).map((belt) => (
              <button
                key={belt}
                onClick={() => startQuiz(belt)}
                className={`
                  p-6 rounded-2xl border-2 transition-all duration-200 text-left group
                  ${belt === Belt.BLUE ? 'border-blue-500 hover:bg-blue-50' : ''}
                  ${belt === Belt.PURPLE ? 'border-purple-500 hover:bg-purple-50' : ''}
                  ${belt === Belt.BROWN ? 'border-amber-800 hover:bg-amber-50' : ''}
                  ${belt === Belt.BLACK ? 'border-zinc-900 hover:bg-zinc-100' : ''}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Simulado</span>
                  <Award className={`w-5 h-5 ${
                    belt === Belt.BLUE ? 'text-blue-500' : 
                    belt === Belt.PURPLE ? 'text-purple-500' : 
                    belt === Belt.BROWN ? 'text-amber-800' : 'text-zinc-900'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold capitalize">Faixa {belt}</h3>
                <p className="text-sm opacity-70 mt-1">20 questões • 60 min • 70% para passar</p>
                <div className="mt-4 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Começar agora <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-200 flex flex-wrap justify-center gap-8 text-zinc-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Regras 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">IBJJF Certified</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (quizState?.isFinished) {
    const score = calculateScore();
    const percentage = score / quizState.questions.length;
    const passed = percentage >= PASSING_SCORE;

    return (
      <div className="min-h-screen bg-[#f5f5f5] p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className={`p-8 text-center ${passed ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
            {passed ? <Trophy className="w-16 h-16 mx-auto mb-4" /> : <AlertCircle className="w-16 h-16 mx-auto mb-4" />}
            <h2 className="text-3xl font-bold mb-2">
              {passed ? 'Aprovado!' : 'Tente Novamente'}
            </h2>
            <p className="opacity-90">
              Você acertou {score} de {quizState.questions.length} questões
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Porcentagem</span>
              <span className="text-2xl font-bold">{(percentage * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Tempo Restante</span>
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={() => startQuiz(selectedBelt)}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-5 h-5" /> Refazer Simulado
              </button>
              <button
                onClick={() => setSelectedBelt(null)}
                className="w-full py-4 border-2 border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const currentAnswer = quizState.answers[quizState.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedBelt(null)}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h2 className="font-bold text-zinc-900">Faixa {selectedBelt}</h2>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Questão {quizState.currentQuestionIndex + 1} de {quizState.questions.length}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-zinc-100 text-zinc-600'}`}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-zinc-100 w-full">
          <motion.div 
            className="h-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={quizState.currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <Info className="w-3 h-3" /> {currentQuestion.module}
              </div>
              <h1 className="text-3xl font-bold leading-tight text-zinc-900">
                {currentQuestion.text}
              </h1>
            </div>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentAnswer === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const showResult = showExplanation;

                let buttonClass = "w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group ";
                
                if (!showResult) {
                  buttonClass += isSelected 
                    ? "border-zinc-900 bg-zinc-900 text-white" 
                    : "border-zinc-200 hover:border-zinc-400 bg-white";
                } else {
                  if (isCorrect) {
                    buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                  } else if (isSelected) {
                    buttonClass += "border-rose-500 bg-rose-50 text-rose-900";
                  } else {
                    buttonClass += "border-zinc-100 bg-white opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult}
                    onClick={() => handleAnswer(idx)}
                    className={buttonClass}
                  >
                    <span className="font-medium text-lg">{option}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-zinc-100 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <BookOpen className="w-5 h-5" /> Explicação da Regra
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={nextQuestion}
                  className="mt-4 w-full py-4 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  {quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Finalizar Simulado' : 'Próxima Questão'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
