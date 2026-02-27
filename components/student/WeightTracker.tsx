import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Scale, TrendingDown, TrendingUp, Minus, Flame, ChevronDown,
    ChevronUp, Plus, Save, Trash2, Activity, Target, Edit3, Info
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { InstructionBalloon } from '../ui/InstructionBalloon';

interface WeightRecord {
    id: string;
    weight_kg: number;
    recorded_at: string;
    created_at?: string;
    notes?: string;
}

interface PhysicalProfile {
    height_cm: number | null;
    birth_year: number | null;
    gender: string;
    activity_level: string;
    fitness_goal: string;
}

interface WeightTrackerProps {
    userId: string;
    readOnly?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVITY_LEVELS = [
    { value: 'sedentario', label: 'Sedentário', desc: 'Sem exercício', factor: 1.2 },
    { value: 'leve', label: 'Levemente ativo', desc: '1–3 dias/semana', factor: 1.375 },
    { value: 'moderado', label: 'Moderadamente ativo', desc: '3–5 dias/semana', factor: 1.55 },
    { value: 'intenso', label: 'Muito ativo', desc: '6–7 dias/semana', factor: 1.725 },
    { value: 'extremo', label: 'Extremamente ativo', desc: 'Atleta/físico intenso', factor: 1.9 },
];

const FITNESS_GOALS = [
    { value: 'perder', label: 'Perder peso', modifier: -500, color: '#ef4444' },
    { value: 'manter', label: 'Manter peso', modifier: 0, color: '#3b82f6' },
    { value: 'ganhar', label: 'Ganhar massa', modifier: +300, color: '#22c55e' },
];

// ─── TMB Calculation (Mifflin-St Jeor) ───────────────────────────────────────

function calcTMB(weight: number, height: number, age: number, gender: string) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'feminino' ? base - 161 : base + 5;
}

function getAge(birthYear: number) {
    return new Date().getFullYear() - birthYear;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 shadow-2xl text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-white italic">{payload[0]?.value?.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span></p>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const WeightTracker: React.FC<WeightTrackerProps> = ({ userId, readOnly = false }) => {
    // Profile state
    const [profile, setProfile] = useState<PhysicalProfile>({
        height_cm: null, birth_year: null,
        gender: 'masculino', activity_level: 'moderado', fitness_goal: 'manter'
    });
    const [profileDraft, setProfileDraft] = useState<PhysicalProfile | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Weight state
    const [history, setHistory] = useState<WeightRecord[]>([]);
    const [newWeight, setNewWeight] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
    const [savingWeight, setSavingWeight] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch physical profile from user_profiles
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('height_cm, birth_year, gender, activity_level, fitness_goal')
                .eq('user_id', userId)
                .single();

            if (profileData) {
                setProfile({
                    height_cm: profileData.height_cm ?? null,
                    birth_year: profileData.birth_year ?? null,
                    gender: profileData.gender ?? 'masculino',
                    activity_level: profileData.activity_level ?? 'moderado',
                    fitness_goal: profileData.fitness_goal ?? 'manter',
                });
            }

            // Fetch weight history - ordenado por data e depois por data de inserção
            const { data: weightData } = await supabase
                .from('student_weight_history')
                .select('id, weight_kg, recorded_at, created_at, notes')
                .eq('user_id', userId)
                .order('recorded_at', { ascending: true })
                .order('created_at', { ascending: true });

            if (weightData) setHistory(weightData);
        } catch (e) {
            console.error('WeightTracker fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Save Physical Profile ──────────────────────────────────────────────

    const handleSaveProfile = async () => {
        if (!profileDraft) return;
        setSavingProfile(true);
        try {
            const profileData = {
                user_id: userId,
                height_cm: profileDraft.height_cm,
                birth_year: profileDraft.birth_year,
                gender: profileDraft.gender,
                activity_level: profileDraft.activity_level,
                fitness_goal: profileDraft.fitness_goal,
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert(profileData, { onConflict: 'user_id' });

            if (error) throw error;

            setProfile(profileDraft);
            setEditingProfile(false);
        } catch (e) {
            console.error('Error saving profile:', e);
        } finally {
            setSavingProfile(false);
        }
    };

    // ── Register Weight ────────────────────────────────────────────────────

    const handleRegisterWeight = async () => {
        const w = parseFloat(newWeight.replace(',', '.'));
        if (isNaN(w) || w < 20 || w > 400) return;
        setSavingWeight(true);
        try {
            const { data, error } = await supabase
                .from('student_weight_history')
                .insert([{ user_id: userId, weight_kg: w, recorded_at: recordDate, notes: newNotes || null }])
                .select()
                .single();
            if (error) throw error;
            if (data) {
                setHistory(prev => {
                    const updated = [...prev, data];
                    // Mantém ordenado por data e depois por inserção
                    return updated.sort((a, b) => {
                        const dateA = new Date(a.recorded_at).getTime();
                        const dateB = new Date(b.recorded_at).getTime();
                        if (dateA !== dateB) return dateA - dateB;
                        // Se mesma data, usa timestamp de criação como fallback
                        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                    });
                });
            }
            setNewWeight('');
            setNewNotes('');
            setRecordDate(new Date().toISOString().split('T')[0]);
        } catch (e) {
            console.error('Error registering weight:', e);
        } finally {
            setSavingWeight(false);
        }
    };

    const handleDeleteWeight = async (id: string) => {
        setHistory(prev => prev.filter(r => r.id !== id));
        await supabase.from('student_weight_history').delete().eq('id', id);
    };

    // ── TMB / TDEE Calculations ────────────────────────────────────────────

    const latestRecord = history.length > 0 ? history[history.length - 1] : null;
    const currentWeight = latestRecord?.weight_kg ?? null;
    const firstWeight = history.length > 0 ? history[0].weight_kg : null;
    const calculationDate = latestRecord ? new Date(latestRecord.recorded_at + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : null;

    const tmbData = useMemo(() => {
        if (!currentWeight || !profile.height_cm || !profile.birth_year) return null;
        const age = getAge(profile.birth_year);
        const tmb = Math.round(calcTMB(currentWeight, profile.height_cm, age, profile.gender));
        const actFactor = ACTIVITY_LEVELS.find(a => a.value === profile.activity_level)?.factor ?? 1.55;
        const tdee = Math.round(tmb * actFactor);
        const goal = FITNESS_GOALS.find(g => g.value === profile.fitness_goal);
        const meta = tdee + (goal?.modifier ?? 0);
        return { tmb, tdee, meta, goalColor: goal?.color ?? '#3b82f6' };
    }, [currentWeight, profile]);

    const weightDiff = currentWeight && firstWeight ? (currentWeight - firstWeight) : null;

    // ── Chart Data ─────────────────────────────────────────────────────────

    const chartData = history.map(r => ({
        date: new Date(r.recorded_at + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: Number(r.weight_kg),
    }));

    const chartMin = history.length > 0 ? Math.floor(Math.min(...history.map(r => Number(r.weight_kg))) - 2) : 50;
    const chartMax = history.length > 0 ? Math.ceil(Math.max(...history.map(r => Number(r.weight_kg))) + 2) : 100;

    const profileComplete = profile.height_cm && profile.birth_year;

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="relative">
            {/* The Balloon - Outside of overflow-hidden container */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[110]">
                <div className="relative w-full md:w-[400px] h-full mx-auto md:mx-0">
                    <InstructionBalloon
                        id="weight-tracker-info"
                        text="Aqui você atualiza seu peso, acompanha sua progressão e visualiza sua Taxa Metabólica e Gasto Calórico."
                        position="bottom"
                        className="!pointer-events-auto mt-16"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] shadow-xl border-[3px] border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl overflow-hidden">
                {/* Header */}
                <button
                    className="w-full flex items-center justify-between p-5 sm:p-6 border-b-2 border-slate-100 dark:border-slate-800"
                    onClick={() => setExpanded(p => !p)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-600 rounded-2xl shadow-lg shadow-red-500/20">
                            <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">
                                Composição Corporal
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {currentWeight ? `${currentWeight} kg atual` : 'TMB · Peso · Evolução'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {weightDiff !== null && (
                            <span className={`flex items-center gap-1 text-xs font-black italic px-2.5 py-1 rounded-full ${weightDiff < 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : weightDiff > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                                {weightDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : weightDiff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                            </span>
                        )}
                        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                </button>

                {expanded && (
                    <div className="p-5 sm:p-6 space-y-6">

                        {/* ── Perfil Físico ── */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Perfil Físico</p>
                                {!readOnly && !editingProfile && (
                                    <button
                                        onClick={() => { setProfileDraft({ ...profile }); setEditingProfile(true); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                                    >
                                        <Edit3 className="w-3 h-3" /> Editar
                                    </button>
                                )}
                            </div>

                            {editingProfile && profileDraft ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Altura (cm)</label>
                                            <input
                                                type="number"
                                                value={profileDraft.height_cm ?? ''}
                                                onChange={e => setProfileDraft(p => p ? { ...p, height_cm: e.target.value ? parseInt(e.target.value) : null } : p)}
                                                placeholder="175"
                                                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:border-red-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ano Nasc.</label>
                                            <input
                                                type="number"
                                                value={profileDraft.birth_year ?? ''}
                                                onChange={e => setProfileDraft(p => p ? { ...p, birth_year: e.target.value ? parseInt(e.target.value) : null } : p)}
                                                placeholder="1990"
                                                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:border-red-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Gênero</label>
                                        <div className="flex gap-2">
                                            {['masculino', 'feminino'].map(g => (
                                                <button key={g} onClick={() => setProfileDraft(p => p ? { ...p, gender: g } : p)}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${profileDraft.gender === g ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-400'}`}>
                                                    {g === 'masculino' ? '♂ Masculino' : '♀ Feminino'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Nível de Atividade</label>
                                        <select
                                            value={profileDraft.activity_level}
                                            onChange={e => setProfileDraft(p => p ? { ...p, activity_level: e.target.value } : p)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:border-red-500 outline-none transition-all appearance-none"
                                        >
                                            {ACTIVITY_LEVELS.map(a => (
                                                <option key={a.value} value={a.value}>{a.label} — {a.desc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Objetivo</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {FITNESS_GOALS.map(g => (
                                                <button key={g.value} onClick={() => setProfileDraft(p => p ? { ...p, fitness_goal: g.value } : p)}
                                                    className={`py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${profileDraft.fitness_goal === g.value ? 'text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}
                                                    style={profileDraft.fitness_goal === g.value ? { backgroundColor: g.color } : {}}>
                                                    {g.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => setEditingProfile(false)}
                                            className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider transition-all hover:bg-slate-300 dark:hover:bg-slate-600">
                                            Cancelar
                                        </button>
                                        <button onClick={handleSaveProfile} disabled={savingProfile}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
                                            <Save className="w-3.5 h-3.5" />
                                            {savingProfile ? 'Salvando...' : 'Salvar'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Altura', value: profile.height_cm ? `${profile.height_cm} cm` : '—' },
                                        { label: 'Idade', value: profile.birth_year ? `${getAge(profile.birth_year)} anos` : '—' },
                                        { label: 'Gênero', value: profile.gender === 'feminino' ? '♀ Feminino' : '♂ Masculino' },
                                        { label: 'Objetivo', value: FITNESS_GOALS.find(g => g.value === profile.fitness_goal)?.label ?? '—' },
                                    ].map(item => (
                                        <div key={item.label} className="text-center">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5 italic">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── TMB Results ── */}
                        {tmbData && profileComplete ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Resultados de Metabolismo
                                    </p>
                                    <button
                                        onClick={() => setShowInfo(!showInfo)}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <Info className={`w-3.5 h-3.5 ${showInfo ? 'text-red-500' : 'text-slate-400'}`} />
                                    </button>
                                </div>

                                {showInfo && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 text-[11px] leading-relaxed text-blue-800 dark:text-blue-300 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="font-bold mb-1 uppercase tracking-wider text-[9px]">O que são esses valores?</p>
                                        <ul className="space-y-2">
                                            <li><strong>TMB (Taxa Metabólica Basal):</strong> Calorias que seu corpo queima em repouso absoluto para manter funções vitais (respiração, batimentos, etc).</li>
                                            <li><strong>TDEE:</strong> Seu gasto calórico total diário, considerando sua TMB + o nível de atividade física selecionado.</li>
                                        </ul>
                                    </div>
                                )}

                                <div className="bg-slate-900 border-2 border-white/5 rounded-2xl p-6 space-y-4 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">
                                            Base: {calculationDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-sm font-medium text-slate-400 tracking-tight">TMB:</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-white tracking-tight">{tmbData.tmb}</span>
                                            <span className="text-xs text-slate-500">kcal</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-sm font-medium text-slate-400 tracking-tight">TDEE:</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-white tracking-tight">{tmbData.tdee}</span>
                                            <span className="text-xs text-slate-500">kcal</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">META:</span>
                                        <span className="text-3xl font-black text-white italic leading-none">{tmbData.meta}</span>
                                    </div>
                                </div>
                            </div>
                        ) : !profileComplete && !editingProfile ? (
                            <button
                                onClick={() => { setProfileDraft({ ...profile }); setEditingProfile(true); }}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-red-400 hover:text-red-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Preencher perfil físico para calcular TMB
                            </button>
                        ) : null}

                        {/* ── Registro de Peso ── */}
                        {!readOnly && (
                            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4">
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Registrar Peso
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-[2] flex gap-2 min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Peso (kg)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={newWeight}
                                                    onChange={e => setNewWeight(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRegisterWeight()}
                                                    placeholder="Ex: 82.5"
                                                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:border-red-500 outline-none transition-all"
                                                />
                                                <span className="flex items-center px-3 text-xs font-black text-slate-400 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                    kg
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Data</label>
                                        <input
                                            type="date"
                                            value={recordDate}
                                            onChange={e => setRecordDate(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-xs focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleRegisterWeight}
                                            disabled={savingWeight || !newWeight}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-40 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap h-[46px]"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {savingWeight ? '...' : 'Registrar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Gráfico de Evolução ── */}
                        {history.length > 1 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Evolução do Peso
                                </p>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#1e293b" strokeOpacity={0.5} strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[chartMin, chartMax]} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="peso" stroke="#ef4444" strokeWidth={3} fill="url(#weightGrad)" dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#ef4444' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ── Histórico ── */}
                        {history.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Histórico
                                </p>
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                    {[...history].reverse().map((rec, i) => {
                                        const prev = history[history.length - 2 - i];
                                        const diff = prev ? Number(rec.weight_kg) - Number(prev.weight_kg) : null;
                                        return (
                                            <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-slate-100 dark:border-slate-800 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white italic">
                                                            {Number(rec.weight_kg).toFixed(1)} kg
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold">
                                                            {new Date(rec.recorded_at + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {diff !== null && (
                                                        <span className={`text-[10px] font-black italic px-2 py-0.5 rounded-full ${diff < 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : diff > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400'}`}>
                                                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                        </span>
                                                    )}
                                                    {!readOnly && (
                                                        <button
                                                            onClick={() => handleDeleteWeight(rec.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Empty State ── */}
                        {history.length === 0 && !loading && (
                            <div className="text-center py-6 text-slate-400">
                                <Scale className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-black uppercase tracking-widest">Nenhum peso registrado ainda</p>
                                <p className="text-[10px] mt-1 opacity-60">Registre seu peso acima para começar a acompanhar sua evolução</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
