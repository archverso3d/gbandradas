import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface OnboardingStep {
    target: string; // CSS selector or data-tour value
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingGuideProps {
    steps: OnboardingStep[];
    onComplete: () => void;
    onSkip: () => void;
    isOpen: boolean;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ steps, onComplete, onSkip, isOpen }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const guideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && steps[currentStep]) {
            const updatePosition = () => {
                const element = document.querySelector(`[data-tour="${steps[currentStep].target}"]`) ||
                    document.querySelector(steps[currentStep].target);

                if (element) {
                    const rect = element.getBoundingClientRect();
                    setCoords({
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height
                    });

                    // Smooth scroll to element
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);
            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        }
    }, [isOpen, currentStep, steps]);

    if (!isOpen) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto" onClick={onSkip} />

            {/* Spotlight */}
            <div
                className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] rounded-xl transition-all duration-300 ease-in-out z-10"
                style={{
                    top: coords.top - 8,
                    left: coords.left - 8,
                    width: coords.width + 16,
                    height: coords.height + 16,
                    pointerEvents: 'none'
                }}
            />

            {/* Balloon */}
            <div
                ref={guideRef}
                className="absolute z-20 pointer-events-auto w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all duration-300 animate-in fade-in zoom-in"
                style={{
                    top: coords.top + coords.height + 24,
                    left: Math.max(16, Math.min(window.innerWidth - 300, coords.left + (coords.width / 2) - 150))
                }}
            >
                {/* Arrow */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-bottom-[12px] border-b-white dark:border-b-slate-900" />

                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">
                        Passo {currentStep + 1} de {steps.length}
                    </span>
                    <button
                        onClick={onSkip}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
                    {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {step.content}
                </p>

                <div className="flex justify-between items-center gap-3">
                    <button
                        onClick={onSkip}
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        Pular Guia
                    </button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-black uppercase text-[11px] tracking-wider italic shadow-[0_4px_0_0_#991b1b] hover:shadow-[0_2px_0_0_#991b1b] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>
                                    <span>Concluir</span>
                                    <Check className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <span>Próximo</span>
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
