import React from 'react';
import { Settings, Award, Clock, CheckCircle2, Mail, Phone, User, Save, Play, Video, Trash2, AlertCircle } from 'lucide-react';
import { StudentProfile, adminService } from '../../services/admin';
import { AttendanceCalendar } from './AttendanceCalendar';

interface StudentDetailsEditorProps {
    student: StudentProfile;
    onUpdate: (updates: Partial<StudentProfile>) => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    onMarkAttendance: (date?: Date) => void;
    attendanceRefresh?: number;
    onDelete?: (userId: string) => Promise<void>;
    onRestore?: (userId: string) => Promise<void>;
    onPermanentDelete?: (userId: string) => Promise<void>;
}

const BELTS = [
    { id: 'White Belt', name: 'Faixa Branca', color: '#FFFFFF', border: '#E2E8F0', text: '#64748B' },
    { id: 'Gray Belt', name: 'Faixa Cinza', color: '#94A3B8', border: '#64748B', text: '#FFFFFF' },
    { id: 'Yellow Belt', name: 'Faixa Amarela', color: '#FDE047', border: '#EAB308', text: '#854D0E' },
    { id: 'Orange Belt', name: 'Faixa Laranja', color: '#FB923C', border: '#F97316', text: '#FFFFFF' },
    { id: 'Green Belt', name: 'Faixa Verde', color: '#22C55E', border: '#16A34A', text: '#FFFFFF' },
    { id: 'Blue Belt', name: 'Faixa Azul', color: '#2563EB', border: '#1D4ED8', text: '#FFFFFF' },
    { id: 'Purple Belt', name: 'Faixa Roxa', color: '#7E22CE', border: '#6B21A8', text: '#FFFFFF' },
    { id: 'Brown Belt', name: 'Faixa Marrom', color: '#78350F', border: '#451A03', text: '#FFFFFF' },
    { id: 'Black Belt', name: 'Faixa Preta', color: '#0F172A', border: '#020617', text: '#FFFFFF', tip: '#DC2626' },
];

const BeltVisual: React.FC<{ belt: string; degrees: number }> = ({ belt, degrees }) => {
    const selectedBelt = BELTS.find(b => b.id === belt) || BELTS[0];
    // Gracie Barra standard: up to brown is black tip, black belt is red tip.
    const tipColor = selectedBelt.id === 'Black Belt' ? 'bg-red-600' : 'bg-slate-900';

    return (
        <div
            className="w-full h-12 rounded-xl border-2 flex overflow-hidden shadow-sm transition-all duration-500"
            style={{
                backgroundColor: selectedBelt.color,
                borderColor: selectedBelt.border
            }}
        >
            <div className="flex-1 flex items-center px-4">
                <span className="font-black italic uppercase tracking-wider text-[10px]" style={{ color: selectedBelt.text }}>
                    {selectedBelt.name}
                </span>
            </div>
            <div className={`w-28 ${tipColor} relative flex items-center justify-center gap-1.5 px-4 animate-in fade-in slide-in-from-right-4`}>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-8 rounded-full transition-all duration-700 ${i < degrees ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export const StudentDetailsEditor: React.FC<StudentDetailsEditorProps> = ({

    student,
    onUpdate,
    onSave,
    onMarkAttendance,
    attendanceRefresh,
    onDelete,
    onRestore,
    onPermanentDelete
}) => {
    const isDeleted = !!student.deleted_at;
    const [techniques, setTechniques] = React.useState<any[]>([]);
    const [loadingTechs, setLoadingTechs] = React.useState(true);
    const [showTechniques, setShowTechniques] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);
    const [deleteStep, setDeleteStep] = React.useState<0 | 1 | 2>(0);

    const handleDeleteClick = async () => {
        if (deleteStep === 0) {
            setDeleteStep(1);
            setTimeout(() => {
                setDeleteStep(prev => prev === 1 ? 0 : prev);
            }, 3000);
        } else if (deleteStep === 1) {
            const confirmation = window.prompt(
                `Atenção: A exclusão de ${student.full_name || 'este aluno'} apagará TODOS os dados, incluindo histórico e vídeos salvos!\n\nPara confirmar, digite EXCLUIR:`
            );

            if (confirmation !== 'EXCLUIR') {
                alert('A exclusão foi cancelada.');
                setDeleteStep(0);
                return;
            }

            if (onDelete) {
                setDeleteStep(2);
                try {
                    await onDelete(student.user_id);
                } catch (error) {
                    console.error('Delete failed:', error);
                    setDeleteStep(0);
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSaved(false);
        try {
            await onSave(e);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };


    React.useEffect(() => {
        const loadTechniques = async () => {
            try {
                const data = await adminService.getSavedTechniques(student.user_id);
                setTechniques(data || []);
            } catch (error) {
                console.error('Error loading techniques:', error);
            } finally {
                setLoadingTechs(false);
            }
        };
        loadTechniques();
    }, [student.user_id]);

    const handleMarkPast = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        onMarkAttendance(date);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Deleted Banner */}
            {isDeleted && (
                <div className="lg:col-span-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <div>
                            <h4 className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-widest">Aluno na Lixeira (Limbo)</h4>
                            <p className="text-xs text-red-700 dark:text-red-300 font-medium">Este aluno foi excluído e será deletado permanentemente em breve. Ações normais estão bloqueadas.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRestore && (
                            <button
                                onClick={() => onRestore(student.user_id)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors shadow-sm"
                            >
                                Restaurar Aluno
                            </button>
                        )}
                        {onPermanentDelete && (
                            <button
                                onClick={() => {
                                    if (window.confirm('CUIDADO: Isso excluirá o aluno permanentemente SEM CHANCE DE RECUPERAÇÃO. Tem certeza?')) {
                                        onPermanentDelete(student.user_id);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors shadow-sm"
                            >
                                Excluir Permanentemente
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Left Column: Attendance & Actions */}
            <div className={`lg:col-span-5 space-y-6 ${isDeleted ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                {/* Quick Action: Mark Presence */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-emerald-400 uppercase italic">Registro Rápido</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Marcar presença para aula de hoje</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onMarkAttendance()}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-wider italic transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 group text-sm"
                        >
                            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            PRESENÇA HOJE
                        </button>
                    </div>
                </div>

                {/* Attendance Calendar */}
                <AttendanceCalendar
                    studentId={student.user_id}
                    refreshTrigger={attendanceRefresh}
                    onMarkPast={handleMarkPast}
                    studentCategory={student.student_category}
                />

                {/* Saved Techniques View (Collapsible) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <button
                        onClick={() => setShowTechniques(!showTechniques)}
                        className="w-full p-5 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                <Video className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.15em] italic">Técnicas Salvas</h3>
                        </div>
                        <div className={`transform transition-transform ${showTechniques ? 'rotate-180' : ''}`}>
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                <Settings className="w-3 h-3" />
                            </div>
                        </div>
                    </button>

                    {showTechniques && (
                        <div className="p-4 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2">
                            {loadingTechs ? (
                                <div className="flex justify-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : techniques.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {techniques.map((tech) => (
                                        <a
                                            key={tech.id}
                                            href={tech.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-blue-200 dark:hover:border-blue-800 transition-all p-2"
                                        >
                                            <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center rounded-lg shrink-0">
                                                <Play className="w-4 h-4 text-white/50 group-hover:text-white transition-all" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase italic truncate">{tech.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">{tech.category || 'Geral'}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-400 text-[10px] font-medium italic">Nenhuma técnica salva.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Profile & Details */}
            <div className="lg:col-span-7 space-y-6">
                {/* Profile Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 dark:bg-red-900/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-2 border-white dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/30 shrink-0">
                            {student.avatar_url ? (
                                <img src={student.avatar_url} alt="" className="w-full h-full object-cover object-top" />
                            ) : (
                                <User className="w-10 h-10 text-slate-200 dark:text-slate-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-1">
                                        {student.full_name}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const b = BELTS.find(x => x.id === student.current_belt) || BELTS[0];
                                            return (
                                                <span
                                                    className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors"
                                                    style={{ backgroundColor: b.color, borderColor: b.border, color: b.text }}
                                                >
                                                    {b.name}
                                                </span>
                                            );
                                        })()}
                                        {student.degrees > 0 && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800 shadow-sm">
                                                {[...Array(student.degrees)].map((_, i) => (
                                                    <div key={i} className="w-1 h-3 bg-white rounded-full last:animate-pulse" />
                                                ))}
                                                <span className="text-[9px] font-black text-white uppercase tracking-tighter ml-1">
                                                    {student.degrees}º Grau
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!isDeleted && onDelete && (
                                    <button
                                        onClick={handleDeleteClick}
                                        type="button"
                                        className={`
                                            p-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0
                                            ${deleteStep === 0 ? 'text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 border border-slate-100 dark:border-slate-700' : ''}
                                            ${deleteStep === 1 ? 'text-white bg-red-500 hover:bg-red-600 shadow-red-500/30 border-transparent' : ''}
                                            ${deleteStep === 2 ? 'text-white bg-red-400 cursor-not-allowed border-transparent' : ''}
                                        `}
                                        title={deleteStep === 0 ? "Excluir Aluno" : "Confirmar Exclusão"}
                                    >
                                        {deleteStep === 0 && <Trash2 className="w-4 h-4" />}
                                        {deleteStep === 1 && (
                                            <>
                                                <AlertCircle className="w-4 h-4 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Confirmar?</span>
                                            </>
                                        )}
                                        {deleteStep === 2 && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 pt-1">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate max-w-[200px]">{student.email}</span>
                                </div>
                                {student.phone && (
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{student.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors ${isDeleted ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <Award className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider italic">Graduação & Evolução</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão de progresso técnico</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Main Progression Group */}
                            <div className="space-y-6">
                                {/* Belt & Degrees Section */}
                                <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/20 rounded-full -mr-16 -mt-16 blur-3xl" />

                                    <div className="flex items-center justify-between relative z-10">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                            Nível do Praticante
                                        </label>
                                        <span className="text-[10px] font-black text-slate-300 uppercase italic">Jiu-Jitsu Brasileiro</span>
                                    </div>

                                    <BeltVisual belt={student.current_belt} degrees={student.degrees} />

                                    <div className="grid grid-cols-1 gap-6 pt-2 relative z-10">
                                        <div className="space-y-3">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">Selecione a Cor da Faixa</span>
                                            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                                                {BELTS.map((b) => (
                                                    <button
                                                        key={b.id}
                                                        type="button"
                                                        onClick={() => onUpdate({ current_belt: b.id })}
                                                        className={`
                                                            h-10 rounded-xl border-2 transition-all relative overflow-hidden group/btn
                                                            ${student.current_belt === b.id
                                                                ? 'border-red-500 scale-105 shadow-lg shadow-red-100'
                                                                : 'border-white dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                                                            }
                                                        `}
                                                        style={{ backgroundColor: b.color }}
                                                        title={b.name}
                                                    >
                                                        {student.current_belt === b.id && (
                                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500" />
                                                        )}
                                                        <div className={`absolute bottom-0 right-0 w-3 h-full ${b.id === 'Black Belt' ? 'bg-red-500/20' : 'bg-slate-900/10'} group-hover/btn:bg-slate-900/20`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">Graus (Stripes) na Ponta</span>
                                            <div className="flex bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-1.5 rounded-2xl gap-1 border border-slate-100 dark:border-slate-700 shadow-inner">
                                                {[0, 1, 2, 3, 4].map((d) => (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => onUpdate({ degrees: d })}
                                                        className={`
                                                            flex-1 py-3 rounded-xl font-black text-xs transition-all relative
                                                            ${student.degrees === d
                                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200 -translate-y-0.5'
                                                                : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                            }
                                                        `}
                                                    >
                                                        {d}º
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-3 bg-red-600 rounded-full" />
                                        Programa de Treino
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['MC', 'PC1', 'PC2', 'Juniors', 'GB1', 'GB2', 'GB F'].map((cat) => {
                                            const isSelected = student.student_category === cat;
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => onUpdate({ student_category: cat })}
                                                    className={`
                                                        px-4 py-2.5 rounded-xl font-black text-[10px] border transition-all uppercase tracking-widest
                                                        ${isSelected
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg -translate-y-0.5'
                                                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
                                                        }
                                                    `}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Group */}
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                                    {/* Start Date */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Data de Início (Carreira)</label>
                                        <div className="relative group">
                                            <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="date"
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-red-50/30 focus:border-red-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm text-sm"
                                                value={student.start_date || ''}
                                                onChange={(e) => onUpdate({ start_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Graduation Date */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Previsão Próxima Graduação</label>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="date"
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-red-50/30 focus:border-red-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm text-sm"
                                                value={student.next_graduation_date || ''}
                                                onChange={(e) => onUpdate({ next_graduation_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] italic text-center sm:text-left">
                                * Verifique todas as informações antes de salvar o prontuário do aluno.
                            </p>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`
                                    w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] italic transition-all flex items-center justify-center gap-3 active:scale-95 group text-sm shadow-xl
                                    ${isSaved
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'}
                                    ${isSaving ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : isSaved ? (
                                    <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                )}
                                {isSaving ? 'Salvando...' : isSaved ? 'Alterações Salvas!' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
