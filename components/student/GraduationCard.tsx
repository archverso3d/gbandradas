import React, { useEffect, useRef, useState } from 'react';
import { Award, Calendar, TrendingUp, Pencil, Check, X } from 'lucide-react';

interface GraduationCardProps {
    currentBelt: string;
    degrees?: number;
    startDate: string; // ISO date string
    lastPromotionDate?: string; // ISO date string (YYYY-MM-DD)
    nextForecast?: string; // ISO date string
    certificateUrl?: string; // URL to certificate image/pdf
    /** If true, hides the edit buttons. Default: false. */
    readOnly?: boolean;
    /** Called when user saves a new last promotion date (ISO YYYY-MM-DD or empty string to clear). */
    onChangeLastPromotionDate?: (newDate: string) => void | Promise<void>;
    /** Called when user saves a new start date (ISO YYYY-MM-DD or empty string to clear). */
    onChangeStartDate?: (newDate: string) => void | Promise<void>;
}

export const GraduationCard: React.FC<GraduationCardProps> = ({
    currentBelt,
    degrees = 0,
    startDate,
    lastPromotionDate,
    nextForecast,
    readOnly = false,
    onChangeLastPromotionDate,
    onChangeStartDate,
}) => {
    const [editing, setEditing] = useState(false);
    const [draftDate, setDraftDate] = useState<string>(lastPromotionDate || '');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [editingStart, setEditingStart] = useState(false);
    const [draftStart, setDraftStart] = useState<string>(startDate || '');
    const [savingStart, setSavingStart] = useState(false);
    const startInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDraftDate(lastPromotionDate || '');
    }, [lastPromotionDate]);

    useEffect(() => {
        setDraftStart(startDate || '');
    }, [startDate]);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    useEffect(() => {
        if (editingStart) startInputRef.current?.focus();
    }, [editingStart]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString + (dateString.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR');
    };

    const handleSave = async () => {
        if (!onChangeLastPromotionDate) {
            setEditing(false);
            return;
        }
        try {
            setSaving(true);
            await onChangeLastPromotionDate(draftDate);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraftDate(lastPromotionDate || '');
        setEditing(false);
    };

    const handleSaveStart = async () => {
        if (!onChangeStartDate) {
            setEditingStart(false);
            return;
        }
        try {
            setSavingStart(true);
            await onChangeStartDate(draftStart);
            setEditingStart(false);
        } finally {
            setSavingStart(false);
        }
    };

    const handleCancelStart = () => {
        setDraftStart(startDate || '');
        setEditingStart(false);
    };

    // Helper to determine belt color styles with 3D effects
    const getBeltStyles = (belt: string) => {
        const lowerBelt = belt.toLowerCase();
        if (lowerBelt.includes('white') || lowerBelt.includes('branca'))
            return 'bg-white border-2 border-slate-200 text-slate-800 shadow-[0_4px_0_0_#e2e8f0]';
        if (lowerBelt.includes('blue') || lowerBelt.includes('azul'))
            return 'bg-blue-600 text-white shadow-[0_4px_0_0_#1d4ed8]';
        if (lowerBelt.includes('purple') || lowerBelt.includes('roxa'))
            return 'bg-purple-600 text-white shadow-[0_4px_0_0_#6d28d9]';
        if (lowerBelt.includes('brown') || lowerBelt.includes('marrom'))
            return 'bg-amber-800 text-white shadow-[0_4px_0_0_#78350f]';
        if (lowerBelt.includes('black') || lowerBelt.includes('preta'))
            return 'bg-black text-white shadow-[0_4px_0_0_#1e293b]';
        return 'bg-slate-100 text-slate-800 shadow-[0_4px_0_0_#cbd5e1]';
    };

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 p-5 flex flex-col transition-all hover:shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic flex items-center gap-2 drop-shadow-sm">
                        Minha Graduação
                    </h2>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-transform group-hover:-rotate-2 flex items-center gap-2 ${getBeltStyles(currentBelt)}`}>
                        {currentBelt}
                        {degrees > 0 && (
                            <span className="flex gap-0.5 ml-1">
                                {Array.from({ length: degrees }).map((_, i) => (
                                    <span key={i} className={`w-1 h-3 rounded-full ${currentBelt.toLowerCase().includes('white') || currentBelt.toLowerCase().includes('branca') ? 'bg-slate-300' : 'bg-white/40'}`} />
                                ))}
                                <span className="ml-1 opacity-80">{degrees}º GRAU</span>
                            </span>
                        )}
                    </span>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <Award className="w-4 h-4 text-red-600" />
                </div>
            </div>

            <div className="space-y-6 flex-1 relative z-10">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Início da Jornada</p>
                            {!readOnly && !editingStart && (
                                <button
                                    type="button"
                                    onClick={() => setEditingStart(true)}
                                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                    aria-label="Editar data de início da jornada"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Editar
                                </button>
                            )}
                        </div>

                        {editingStart ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    ref={startInputRef}
                                    type="date"
                                    value={draftStart}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDraftStart(e.target.value)}
                                    disabled={savingStart}
                                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold italic text-sm focus:outline-none focus:border-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveStart}
                                    disabled={savingStart}
                                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition-colors"
                                    aria-label="Salvar"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelStart}
                                    disabled={savingStart}
                                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-200 transition-colors"
                                    aria-label="Cancelar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-slate-900 dark:text-slate-100 font-black italic text-lg leading-none">{formatDate(startDate)}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Última Graduação</p>
                            {!readOnly && !editing && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                    aria-label="Editar data da última graduação"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Editar
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    ref={inputRef}
                                    type="date"
                                    value={draftDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDraftDate(e.target.value)}
                                    disabled={saving}
                                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold italic text-sm focus:outline-none focus:border-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition-colors"
                                    aria-label="Salvar"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-200 transition-colors"
                                    aria-label="Cancelar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-slate-900 dark:text-slate-100 font-black italic text-lg leading-none">{formatDate(lastPromotionDate)}</p>
                        )}
                    </div>
                </div>

                {nextForecast && (
                    <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/20">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Previsão Próxima Graduação</p>
                        <p className="text-red-500 font-black text-2xl italic leading-none">{formatDate(nextForecast)}</p>
                        <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mt-2">*Estimativa baseada na frequência</p>
                    </div>
                )}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-800/20 rounded-full blur-3xl group-hover:bg-slate-800/30 transition-colors"></div>
        </div>
    );
};
