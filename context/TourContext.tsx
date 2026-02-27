import React, { createContext, useContext, useState, useEffect } from 'react';

interface TourContextType {
    currentStepId: string | null;
    nextStep: () => void;
    isTourActive: boolean;
    startTour: () => void;
    dismissTour: () => void;
}

const TOUR_STEPS = [
    'graduation-info',
    'curriculum-expand',
    'weight-tracker-info',
    'technique-video-link',
    'calendar-past-days',
    'calendar-mark-today',
    'training-streak',
    'report-summary-info',
    'technique-history',
    'training-focus',
    'category-creation-guide'
];

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [isTourActive, setIsTourActive] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('tour_completed');
        if (!hasCompletedTour) {
            // Find the first step not completed
            const lastStep = localStorage.getItem('tour_current_step');
            if (lastStep) {
                const index = TOUR_STEPS.indexOf(lastStep);
                setCurrentStepIndex(index !== -1 ? index : 0);
            } else {
                setCurrentStepIndex(0);
            }
            setIsTourActive(true);

            // Mark as completed immediately so it doesn't reappear on refresh/second access
            // The user only wants to see it once.
            localStorage.setItem('tour_completed', 'true');
        }
    }, []);

    // Global interception for the tour
    useEffect(() => {
        if (!isTourActive) return;

        const handleGlobalEvent = (e: MouseEvent | TouchEvent | KeyboardEvent) => {
            let target = e.target as HTMLElement | null;
            let isInsideBalloon = false;

            while (target) {
                if (target.classList && target.classList.contains('instruction-balloon')) {
                    isInsideBalloon = true;
                    break;
                }
                target = target.parentElement;
            }

            if (!isInsideBalloon) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Use capture phase to intercept before React synthetic events
        window.addEventListener('click', handleGlobalEvent, true);
        window.addEventListener('touchstart', handleGlobalEvent, true);
        window.addEventListener('keydown', handleGlobalEvent, true);

        return () => {
            window.removeEventListener('click', handleGlobalEvent, true);
            window.removeEventListener('touchstart', handleGlobalEvent, true);
            window.removeEventListener('keydown', handleGlobalEvent, true);
        };
    }, [isTourActive]);

    const nextStep = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            localStorage.setItem('tour_current_step', TOUR_STEPS[nextIndex]);
        } else {
            setIsTourActive(false);
            setCurrentStepIndex(-1);
            localStorage.setItem('tour_completed', 'true');
        }
    };

    const startTour = () => {
        localStorage.removeItem('tour_completed');
        localStorage.removeItem('tour_current_step');
        // Reset all individual instructions if we want a fresh start
        TOUR_STEPS.forEach(step => localStorage.removeItem(`instruction_${step}`));
        setCurrentStepIndex(0);
        setIsTourActive(true);
    };

    const dismissTour = () => {
        setIsTourActive(false);
        setCurrentStepIndex(-1);
        localStorage.setItem('tour_completed', 'true');
    };

    const currentStepId = isTourActive && currentStepIndex !== -1 ? TOUR_STEPS[currentStepIndex] : null;

    return (
        <TourContext.Provider value={{ currentStepId, nextStep, isTourActive, startTour, dismissTour }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
