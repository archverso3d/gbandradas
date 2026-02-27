import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useTour } from '../../context/TourContext';

interface InstructionBalloonProps {
    id: string;
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    className?: string;
}

export const InstructionBalloon: React.FC<InstructionBalloonProps> = ({
    id,
    text,
    position = 'top',
    className = ''
}) => {
    const { currentStepId, nextStep } = useTour();
    const isVisible = currentStepId === id;
    const [balloonRef, setBalloonRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isVisible && balloonRef) {
            // Give it a tiny delay to ensure layout is calculated before scrolling
            setTimeout(() => {
                balloonRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isVisible, balloonRef]);

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        nextStep();
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3',
        'bottom-right': 'top-full right-0 mt-3',
        'bottom-left': 'top-full left-0 mt-3',
        'top-right': 'bottom-full right-0 mb-3',
        'top-left': 'bottom-full left-0 mb-3'
    };

    const arrowPositionClasses = {
        top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r',
        bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l',
        left: 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r',
        right: 'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l',
        'bottom-right': 'top-[-6px] right-6 border-t border-l',
        'bottom-left': 'top-[-6px] left-6 border-t border-l',
        'top-right': 'bottom-[-6px] right-6 border-b border-r',
        'top-left': 'bottom-[-6px] left-6 border-b border-r'
    };

    const animationVariants = {
        hidden: { opacity: 0, scale: 0.95, y: position.includes('top') ? 5 : position.includes('bottom') ? -5 : 0, x: position.includes('left') ? 5 : position.includes('right') ? -5 : 0 },
        visible: { opacity: 1, scale: 1, y: 0, x: 0 },
        exit: { opacity: 0, scale: 0.95, filter: 'blur(2px)' }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={setBalloonRef}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={animationVariants}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
                    className={`instruction-balloon absolute z-[9999] w-72 p-4 bg-white rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.1)] border border-blue-100 ring-4 ring-blue-50/50 ${positionClasses[position]} ${className}`}
                    onClick={handleDismiss}
                >
                    <div className="flex items-start gap-4 relative cursor-pointer group">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-inner shadow-blue-400/20 ring-2 ring-blue-50 relative group-hover:scale-105 transition-transform">
                            {/* Blinking pulse indicator */}
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 z-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 duration-1000"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                            </span>
                            <Info size={20} className="text-white drop-shadow-sm" />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="text-[13px] text-slate-700 font-medium leading-relaxed pr-5 tracking-wide select-none">
                                {text}
                            </p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="absolute -top-1 -right-1 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center bg-white shadow-sm border border-slate-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {/* Tooltip Arrow Layered to conceal inner borders */}
                    <div className={`absolute w-3.5 h-3.5 bg-white border-blue-100 rotate-45 rounded-sm ${arrowPositionClasses[position]} z-[1]`} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
