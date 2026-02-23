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
    'technique-video-link',
    'category-creation-guide',
    'training-streak',
    'technique-history'
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
        }
    }, []);

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
