import React, { useState, useEffect } from 'react';
import { adminService, StudentProfile } from '../services/admin';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Settings,
    ArrowLeft,
    LayoutDashboard,
    LogOut
} from 'lucide-react';
import { StudentMural } from '../components/admin/StudentMural';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { StudentSidebar } from '../components/admin/StudentSidebar';
import { StudentDetailsEditor } from '../components/admin/StudentDetailsEditor';
import { getCurrentCurriculumWeek, getClassLabelByDay } from '../utils/curriculum';
import { WeeklyCurriculum } from '../components/student/WeeklyCurriculum';

const AdminPanel: React.FC = () => {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [currentWeek, setCurrentWeek] = useState<number>(getCurrentCurriculumWeek());
    const [selectedClass, setSelectedClass] = useState<string>(getClassLabelByDay());
    const [savingSettings, setSavingSettings] = useState(false);
    const [attendanceRefresh, setAttendanceRefresh] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [confirmingBatch, setConfirmingBatch] = useState(false);
    const notification = useNotification();

    const { user, isAdmin, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin) {
                navigate('/');
                return;
            }
            loadStudents();
            loadSettings();
        }
    }, [isAdmin, authLoading, navigate]);

    // Scroll to top when a student is selected
    useEffect(() => {
        if (selectedStudent) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedStudent]);

    const loadSettings = async () => {
        // We now calculate currentWeek automatically, but we can still check if there's a manual override in DB if we want.
        // For now, let's stick to the "update alone" request.
        setCurrentWeek(getCurrentCurriculumWeek());
        setSelectedClass(getClassLabelByDay());
    };

    const loadStudents = async () => {
        try {
            const data = await adminService.getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWeek = async (week: number) => {
        setSavingSettings(true);
        try {
            await adminService.updateSetting('curriculum_week', week.toString());
            setCurrentWeek(week);
        } catch (error) {
            notification.alert('Ocorreu um problema técnico ao tentar atualizar a semana do currículo.', 'Erro de Atualização');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        try {
            console.log('Saving student updates:', selectedStudent);
            await adminService.updateStudentDetails(selectedStudent.user_id, {
                current_belt: selectedStudent.current_belt,
                degrees: selectedStudent.degrees,
                next_graduation_date: selectedStudent.next_graduation_date || null,
                start_date: selectedStudent.start_date || null,
                student_category: selectedStudent.student_category
            });

            // Re-load students to sync the main list
            await loadStudents();
        } catch (error: any) {
            console.error('Error updating student:', error);
            const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error);
            notification.alert(`Não foi possível salvar as alterações: ${errorMessage}`, 'Erro ao Salvar');
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleMarkAttendance = async (date?: Date) => {
        if (!selectedStudent) return;
        try {
            // Determine class label based on day of week
            const targetDate = date || new Date();
            const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

            let classLabel = 'A';
            if (dayOfWeek === 3 || dayOfWeek === 4) classLabel = 'B'; // Wed, Thu -> B
            if (dayOfWeek === 5 || dayOfWeek === 6) classLabel = 'N'; // Fri, Sat -> No-Gi

            await adminService.markAttendance(
                selectedStudent.user_id,
                getCurrentCurriculumWeek(targetDate), // Auto-calculate based on target date
                getClassLabelByDay(targetDate),      // Auto-calculate based on target date
                date
            );
            setAttendanceRefresh(prev => prev + 1);
            await loadStudents();
        } catch (error: any) {
            console.error('Error marking attendance:', error);
            const errorMessage = error?.message || error?.details || error?.hint || 'Erro desconhecido';
            notification.alert(
                `Erro ao lançar presença: ${errorMessage}`,
                'Falha no Registro'
            );
        }
    };

    const executeBatchAttendance = async () => {
        if (selectedStudentIds.length === 0) return;

        try {
            setLoading(true);
            const batchWeek = getCurrentCurriculumWeek();
            const batchClass = getClassLabelByDay();

            await adminService.batchMarkAttendance(
                selectedStudentIds,
                batchWeek,
                batchClass
            );
            setAttendanceRefresh(prev => prev + 1);
            setSelectedStudentIds([]);
            setConfirmingBatch(false);
            await loadStudents();
        } catch (error: any) {
            console.error('Error in batch attendance:', error);
            const errMsg = error?.message || error?.details || 'Erro desconhecido';
            notification.alert(`Erro ao processar presenças em lote: ${errMsg}`, 'Erro');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const name = s.full_name || '';
        const email = s.email || '';
        const searchLower = search.toLowerCase();
        return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando Painel...</p>
            </div>
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Sistema de Gestão</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            Admin <span className="text-red-600">Portal</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm">Gerenciamento de alunos, graduações e currículo semanal.</p>
                    </div>

                    {/* Global Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Mobile Sidebar Toggle */}
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="lg:hidden px-4 py-2 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            {showSidebar ? 'Ocultar Lista' : 'Lista de Alunos'}
                        </button>



                        <button
                            onClick={async () => {
                                try {
                                    await signOut();
                                    notification.alert('Sessão administrativa encerrada.', 'Até logo!');
                                } finally {
                                    navigate('/');
                                }
                            }}
                            className="px-5 py-3 bg-slate-900 text-white hover:bg-black rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sair
                        </button>
                    </div>
                </header>

                <div className="mb-8">
                    <WeeklyCurriculum
                        currentBelt="Faixa Preta" // Admins see everything (GB1 & GB2)
                        defaultWeek={currentWeek}
                    />
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Student Directory */}
                    <aside className={`lg:col-span-4 ${showSidebar ? 'block' : 'hidden'} lg:block`}>
                        <StudentSidebar
                            students={filteredStudents}
                            search={search}
                            onSearchChange={setSearch}
                            selectedStudentId={selectedStudent?.user_id}
                            onSelectStudent={(s) => {
                                setSelectedStudent(s);
                                setShowSidebar(false); // Close on select on mobile
                            }}
                            selectedIds={selectedStudentIds}
                            onToggleSelect={handleToggleSelect}
                        />
                    </aside>

                    {/* Right: Content Area */}
                    <div className="lg:col-span-8 h-full min-h-[600px]">
                        {selectedStudent ? (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-black text-xs uppercase tracking-[0.2em] transition-all group"
                                    >
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Mural de Alunos
                                    </button>
                                    <div className="h-0.5 w-8 bg-slate-100 rounded-full" />
                                </div>

                                <StudentDetailsEditor
                                    student={selectedStudent}
                                    onUpdate={(updates) => setSelectedStudent(prev => prev ? { ...prev, ...updates } : null)}
                                    onSave={handleUpdateStudent}
                                    onMarkAttendance={handleMarkAttendance}
                                    attendanceRefresh={attendanceRefresh}
                                    key={selectedStudent.user_id + students.length} // Force reload when data changes
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Mural de Alunos</h2>
                                        <p className="text-slate-400 font-medium text-xs">Distribuição dos alunos por programas oficiais.</p>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100/50">
                                        <Users className="w-6 h-6 text-slate-300" />
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <StudentMural
                                        students={students}
                                        onSelectStudent={(student) => setSelectedStudent(student)}
                                        selectedIds={selectedStudentIds}
                                        onToggleSelect={handleToggleSelect}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                {/* Batch Action Bar */}
                {
                    selectedStudentIds.length > 0 && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
                            <div className={`
                            px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border transition-all duration-300
                            ${confirmingBatch ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-white'}
                        `}>
                                {confirmingBatch ? (
                                    <>
                                        <div className="flex items-center gap-3 pr-6 border-r border-red-500/50">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-red-600">
                                                ?
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-widest text-white">Confirmar Lançamento?</span>
                                                <span className="text-[10px] font-medium text-red-200">
                                                    {selectedStudentIds.length} alunos • S{getCurrentCurriculumWeek()}{getClassLabelByDay()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setConfirmingBatch(false)}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-red-200 hover:text-white transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={executeBatchAttendance}
                                                className="bg-white text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest italic text-xs transition-all shadow-lg"
                                            >
                                                Sim, Lançar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-xs">
                                                {selectedStudentIds.length}
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Alunos Selecionados</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedStudentIds([])}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
                                            >
                                                Limpar
                                            </button>
                                            <button
                                                onClick={() => setConfirmingBatch(true)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest italic text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                            >
                                                Confirmar Presenças (S{getCurrentCurriculumWeek()}{getClassLabelByDay()})
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default AdminPanel;
