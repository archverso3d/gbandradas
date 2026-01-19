import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface NotificationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onClose: (value: boolean) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    title,
    message,
    type,
    onClose
}) => {
    if (!isOpen) return null;

    const isConfirm = type === 'confirm';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !isConfirm && onClose(false)}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className="h-2 w-24 bg-red-600 mx-auto mt-6 rounded-full opacity-20" />

                <div className="p-8 pt-6">
                    {/* Icon & Title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${isConfirm ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {isConfirm ? <Info className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                        <p className="text-slate-600 font-medium text-center leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => onClose(true)}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-2 group ${isConfirm
                                    ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'
                                }`}
                        >
                            {isConfirm ? 'Confirmar' : 'Entendido'}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {isConfirm && (
                            <button
                                onClick={() => onClose(false)}
                                className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-xs"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>

                {/* Close Button (Top Right) - Only for alerts */}
                {!isConfirm && (
                    <button
                        onClick={() => onClose(false)}
                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};
