import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { GraduationCard } from '../components/student/GraduationCard';
import { CalendarComponent } from '../components/CalendarComponent';
import { TechniqueVault } from '../components/student/TechniqueVault';
import { WeeklyCurriculum } from '../components/student/WeeklyCurriculum';
import { TrainingHistory } from '../components/student/TrainingHistory';
import { TechniqueHistory } from '../components/student/TechniqueHistory';
import { LogOut, User as UserIcon, Settings, Calendar, ArrowUp } from 'lucide-react';
import { adminService } from '../services/admin';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getCurrentCurriculumWeek, getClassLabelByDay } from '../utils/curriculum';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { UserMural, MuralProfile } from '../components/student/UserMural';

// Types
interface AttendanceRecord {
    id: string;
    date: string; // mapped from checkin_at
    status: 'present' | 'absent' | 'excused';
    classLabel?: string;
    weekNumber?: number;
}

interface Graduation {
    current_belt: string;
    degrees?: number;
    start_date: string;
    promotion_date?: string;
    next_forecast?: string;
    student_category?: string;
}

interface Technique {
    id: string;
    title: string;
    link: string;
    category: string;
    category_id?: string;
    platform: 'youtube' | 'instagram' | 'other';
    created_at?: string;
}

const StudentArea: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();

    // Data States
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [graduation, setGraduation] = useState<Graduation | null>(null);
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [selectedMuralUser, setSelectedMuralUser] = useState<MuralProfile | null>(null);
    const [currentWeek, setCurrentWeek] = useState<number>(getCurrentCurriculumWeek());
    const [showBackToTop, setShowBackToTop] = useState(false);
    const notification = useNotification();

    // Show/hide back to top button based on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/');
            } else {
                console.log('StudentArea: Fetching data for user:', user.id, 'Profile:', profile);
                fetchData(user.id);
                setCurrentWeek(getCurrentCurriculumWeek());
            }
        }
    }, [user, authLoading, navigate, profile]); // Added profile to dependencies

    const fetchData = async (userId: string, isPeer: boolean = false) => {
        setLoading(true);
        try {
            // Fetch Profile/Graduation if it's a peer
            let activeGraduation: Graduation | null = null;
            let activeStudentCategory: string = 'GB2';

            if (isPeer) {
                console.log('👥 Fetching peer profile data for:', userId);
                const { data: profileData, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (profileError) {
                    console.error('❌ Peer profile fetch error:', profileError);
                } else if (profileData) {
                    activeGraduation = {
                        current_belt: profileData.current_belt || 'Faixa Branca',
                        degrees: profileData.degrees || 0,
                        start_date: profileData.start_date || profileData.created_at,
                        next_forecast: profileData.next_graduation_date,
                        student_category: profileData.student_category || 'GB2'
                    };
                }
            } else if (profile) {
                activeGraduation = {
                    current_belt: profile.current_belt || 'Faixa Branca',
                    degrees: profile.degrees || 0,
                    start_date: profile.start_date || (profile as any).created_at,
                    next_forecast: (profile as any).next_graduation_date,
                    student_category: profile.student_category || 'GB2'
                };
            }

            setGraduation(activeGraduation);

            // Fetch Attendance
            console.log(`📅 Fetching attendance for ${isPeer ? 'peer' : 'user'}:`, userId);
            const attData = await adminService.getStudentAttendance(userId);
            if (attData) {
                console.log(`✅ Fetched ${attData.length} attendance records`);
                const formattedAtt = attData.map((item: any) => {
                    const date = new Date(item.checkin_at);
                    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    return {
                        id: item.id,
                        date: localDateStr,
                        status: item.status,
                        classLabel: item.class_label,
                        weekNumber: getCurrentCurriculumWeek(date)
                    };
                });
                setAttendance(formattedAtt);
            }

            // Fetch Graduation Details (History)
            const { data: gradDataArray, error: gradError } = await supabase
                .from('student_graduations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!gradError && gradDataArray && gradDataArray.length > 0) {
                const gradData = gradDataArray[0];
                setGraduation(prev => ({
                    ...prev!,
                    ...gradData,
                    current_belt: gradData.current_belt || prev?.current_belt || 'Faixa Branca',
                    degrees: gradData.degrees ?? prev?.degrees ?? 0
                }));
            }

            // Fetch Techniques
            await fetchTechniques(userId);

        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechniques = async (userId: string) => {
        try {
            const techData = await adminService.getSavedTechniques(userId);
            if (techData) {
                setTechniques(techData as Technique[]);
            }
        } catch (error) {
            console.error('Error fetching techniques:', error);
        }
    };

    const handleSelectUser = (userId: string, profileSelected: MuralProfile) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (userId === user?.id) {
            setSelectedMuralUser(null);
            fetchData(user.id, false);
        } else {
            setSelectedMuralUser(profileSelected);
            fetchData(userId, true);
        }
    };

    const handleMarkAttendance = async (dateStr?: string) => {
        if (!user?.id) {
            notification.alert('Para registrar sua presença, você precisa estar autenticado.', 'Acesso Necessário');
            return;
        }

        const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();

        try {
            setLoading(true);
            const autoWeek = getCurrentCurriculumWeek(date);
            const autoClass = getClassLabelByDay(date);
            await adminService.markAttendance(user.id, autoWeek, autoClass, date);
            await fetchData(user.id);
        } catch (error) {
            console.error('Error marking self attendance:', error);
            notification.alert(`Erro detalhado: ${(error as any).message || JSON.stringify(error)}`, 'Erro de Sistema');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttendance = async (id: string) => {
        try {
            setLoading(true);
            await adminService.removeAttendance(id);
            if (user) await fetchData(user.id);
            notification.alert('Presença removida com sucesso.', 'Sucesso');
        } catch (error: any) {
            console.error('Error removing attendance:', error);
            notification.alert(`Erro ao remover presença: ${error.message || 'Erro desconhecido'}`, 'Erro');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!user) return;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todayRecord = attendance.find(a => a.date === todayStr);
        if (todayRecord) {
            try {
                setLoading(true);
                const { error } = await supabase.from('student_attendance').delete().eq('id', todayRecord.id);
                if (error) throw error;
                await fetchData(user.id);
            } catch (error) {
                console.error('Error clearing today attendance:', error);
                notification.alert('Erro ao remover presença de hoje.', 'Erro');
            } finally {
                setLoading(false);
            }
        } else {
            notification.alert('Nenhuma presença registrada hoje para remover.', 'Info');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            navigate('/');
        }
    };

    const handleAddTechnique = async (newTech: Omit<Technique, 'id'> & { category_id?: string }) => {
        if (!user?.id) {
            notification.alert('Para garantir que suas técnicas fiquem salvas permanentemente, você precisa estar autenticado em sua conta.', 'Acesso Necessário');
            return;
        }

        // Optimistic update
        const tempId = Math.random().toString();
        console.log('Adding technique (Optimistic):', { ...newTech, id: tempId });
        setTechniques([{ ...newTech, id: tempId } as Technique, ...techniques]);

        if (localStorage.getItem('demo_mode') === 'true') {
            const saved = JSON.parse(localStorage.getItem('demo_data_techniques') || '[]');
            const mockTech = { ...newTech, id: tempId, user_id: user.id, created_at: new Date().toISOString() };
            localStorage.setItem('demo_data_techniques', JSON.stringify([mockTech, ...saved]));
            setTechniques(prev => prev.map(t => t.id === tempId ? mockTech as any : t));
            return;
        }

        const { data, error } = await supabase
            .from('saved_techniques')
            .insert([{
                user_id: user.id,
                title: newTech.title,
                link: newTech.link,
                category: newTech.category,
                category_id: newTech.category_id,
                platform: newTech.platform
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding technique:', error);
            // Revert
            setTechniques(prev => prev.filter(t => t.id !== tempId));
        } else if (data) {
            console.log('Technique saved successfully:', data);
            // Replace temp with real
            setTechniques(prev => prev.map(t => t.id === tempId ? data : t));
        }
    };

    const handleDeleteTechnique = async (id: string) => {
        // Optimistic update
        const prevTechs = [...techniques];
        setTechniques(techniques.filter(t => t.id !== id));

        if (localStorage.getItem('demo_mode') === 'true') {
            const saved = JSON.parse(localStorage.getItem('demo_data_techniques') || '[]');
            localStorage.setItem('demo_data_techniques', JSON.stringify(saved.filter((t: any) => t.id !== id)));
            return;
        }

        const { error } = await supabase.from('saved_techniques').delete().eq('id', id);

        if (error) {
            console.error('Error deleting technique:', error);
            setTechniques(prevTechs); // Revert
        }
    };

    const handleUpdateTechnique = async (id: string, updatedTech: Partial<Technique> & { category_id?: string | null }) => {
        // Optimistic update
        const prevTechs = [...techniques];
        setTechniques(prev => prev.map(t => t.id === id ? { ...t, ...updatedTech } as Technique : t));

        if (localStorage.getItem('demo_mode') === 'true') {
            const saved = JSON.parse(localStorage.getItem('demo_data_techniques') || '[]');
            const updated = saved.map((t: any) => t.id === id ? { ...t, ...updatedTech } : t);
            localStorage.setItem('demo_data_techniques', JSON.stringify(updated));
            return;
        }

        const { error } = await supabase
            .from('saved_techniques')
            .update({
                title: updatedTech.title,
                link: updatedTech.link,
                category: updatedTech.category,
                category_id: updatedTech.category_id,
                platform: updatedTech.platform
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating technique:', error);
            setTechniques(prevTechs); // Revert
            notification.alert(`Não foi possível salvar: ${error.message || 'Erro desconhecido'}`, 'Erro ao Atualizar');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full bg-slate-100 dark:bg-slate-950 pt-20 sm:pt-24 lg:pt-32 pb-12 transition-colors duration-500 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Área do Aluno', icon: <UserIcon className="w-4 h-4" /> }
                        ]}
                    />
                </div>

                <UserMural
                    currentUserId={user?.id || ''}
                    onSelectUser={handleSelectUser}
                    selectedUserId={selectedMuralUser?.user_id || user?.id || ''}
                />

                {/* Header */}
                <div className={`shadow-xl rounded-2xl p-5 sm:p-6 mb-8 border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group ${(() => {
                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                    if (belt.includes('white') || belt.includes('branca')) return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
                    if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-600 border-blue-500';
                    if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-600 border-purple-500';
                    if (belt.includes('brown') || belt.includes('marrom')) return 'bg-amber-800 border-amber-700';
                    if (belt.includes('black') || belt.includes('preta')) return 'bg-slate-900 border-slate-800';
                    return 'bg-[#0F172A] border-slate-800';
                })()}`}>
                    <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto relative z-10">
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 text-slate-400 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden ${(() => {
                            const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                            if (belt.includes('white') || belt.includes('branca')) return 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700';
                            return 'bg-white/10 border-white/20';
                        })()}`}>
                            {(selectedMuralUser?.avatar_url || user?.user_metadata?.avatar_url) ? (
                                <img
                                    src={selectedMuralUser?.avatar_url || user?.user_metadata?.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-7 h-7 sm:w-10 sm:h-10" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className={`text-xl sm:text-3xl font-black italic tracking-tighter truncate drop-shadow-md ${(() => {
                                const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                if (belt.includes('white') || belt.includes('branca')) return 'text-slate-900 dark:text-slate-100';
                                return 'text-white';
                            })()}`}>
                                {selectedMuralUser ? `Perfil de ${selectedMuralUser.full_name?.split(' ')[0]}` : `Olá, ${user?.user_metadata?.full_name?.split(' ')[0] || 'Visitante'}`}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-1">
                                <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] italic ${(() => {
                                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                    if (belt.includes('white') || belt.includes('branca')) return 'text-slate-500';
                                    return 'text-white/60';
                                })()}`}>Bem-vindo à sua área exclusiva</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] font-black uppercase tracking-[0.15em]">
                                    <span className={`w-1 h-1 rounded-full hidden sm:block ${(() => {
                                        const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                        if (belt.includes('white') || belt.includes('branca')) return 'bg-slate-300 dark:bg-slate-700';
                                        return 'bg-white/30';
                                    })()}`}></span>
                                    <span className={`px-3 py-1 rounded-lg transition-all duo-btn-3d ${(() => {
                                        const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                        if (belt.includes('white') || belt.includes('branca')) return 'bg-white text-slate-800 shadow-[0_3px_0_0_#e2e8f0]';
                                        if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-500 text-white shadow-[0_3px_0_0_#1d4ed8]';
                                        if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-500 text-white shadow-[0_3px_0_0_#6d28d9]';
                                        if (belt.includes('brown') || belt.includes('marrom')) return 'bg-amber-700 text-white shadow-[0_3px_0_0_#78350f]';
                                        if (belt.includes('black') || belt.includes('preta')) return 'bg-slate-800 text-white shadow-[0_3px_0_0_#1e293b]';
                                        return 'bg-slate-700 text-white shadow-[0_3px_0_0_#334155]';
                                    })()}`}>
                                        {graduation?.current_belt || 'Faixa Branca'} {graduation?.degrees !== undefined ? `${graduation.degrees}º Grau` : '0º Grau'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] italic transition-all duo-btn-3d min-h-[40px] ${(() => {
                                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                    if (belt.includes('white') || belt.includes('branca')) return 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#0f172a]';
                                    return 'bg-white/10 text-white hover:bg-white/20 shadow-[0_3px_0_0_rgba(0,0,0,0.2)]';
                                })()}`}
                                aria-label="Ir para painel administrativo"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Admin</span>
                            </button>
                        )}
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/10 -mr-20 -mt-20 rounded-full blur-3xl group-hover:bg-slate-800/20 transition-all duration-700"></div>
                </div>

                <div className="mb-6">
                    <WeeklyCurriculum
                        currentBelt={graduation?.current_belt || 'Faixa Branca'}
                        defaultWeek={currentWeek}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Graduation & Calendar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Calendar */}
                        <CalendarComponent
                            attendanceData={attendance}
                            onMarkToday={() => handleMarkAttendance()}
                            onMarkPast={(date) => handleMarkAttendance(date)}
                            onRemoveAttendance={handleRemoveAttendance}
                            onClear={handleClear}
                            readOnly={!!selectedMuralUser}
                            currentWeek={currentWeek}
                        />

                        {/* Training History & Stats */}
                        <TrainingHistory
                            attendanceData={attendance}
                            studentStartDate={graduation?.start_date || '2024-01-01'}
                            studentCategory={graduation?.student_category || 'GB2'}
                        />

                        {/* Technique History */}
                        <TechniqueHistory
                            attendanceData={attendance}
                            studentCategory={graduation?.student_category || 'GB2'}
                        />

                        {/* Graduation Card */}
                        <GraduationCard
                            currentBelt={graduation?.current_belt || 'Faixa Branca'}
                            startDate={graduation?.start_date || '2024-01-01'}
                            lastPromotionDate={graduation?.promotion_date}
                            nextForecast={graduation?.next_forecast}
                        />
                    </div>

                    {/* Right Column: Content/Techniques */}
                    <div className="lg:col-span-2">
                        <TechniqueVault
                            techniques={techniques}
                            onAddTechnique={handleAddTechnique}
                            onUpdateTechnique={handleUpdateTechnique}
                            onDeleteTechnique={handleDeleteTechnique}
                            readOnly={!!selectedMuralUser && selectedMuralUser.user_id !== user?.id}
                            title={selectedMuralUser ? `Técnicas de ${selectedMuralUser.full_name?.split(' ')[0]}` : "Minhas Técnicas"}
                            isLoading={loading}
                        />
                    </div>
                </div>

                {/* Floating Back to Top Button */}
                {showBackToTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-all hover:scale-110 active:scale-95 min-w-[56px] min-h-[56px] flex items-center justify-center lg:hidden"
                        aria-label="Voltar ao topo"
                    >
                        <ArrowUp className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default StudentArea;
