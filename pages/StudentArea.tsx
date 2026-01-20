import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { GraduationCard } from '../components/student/GraduationCard';
import { CalendarComponent } from '../components/CalendarComponent';
import { TechniqueVault } from '../components/student/TechniqueVault';
import { WeeklyCurriculum } from '../components/student/WeeklyCurriculum';
import { TrainingHistory } from '../components/student/TrainingHistory';
import { LogOut, User as UserIcon, Settings, Calendar, ArrowUp } from 'lucide-react';
import { adminService } from '../services/admin';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getCurrentCurriculumWeek, getClassLabelByDay } from '../utils/curriculum';
import { Breadcrumb } from '../components/ui/Breadcrumb';

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
}

interface Technique {
    id: string;
    title: string;
    link: string;
    category: string;
    platform: 'youtube' | 'instagram' | 'other';
}

const StudentArea: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();

    // Data States
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [graduation, setGraduation] = useState<Graduation | null>(null);
    const [techniques, setTechniques] = useState<Technique[]>([]);
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

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Use profile from auth context for basic info
            if (profile) {
                console.log('StudentArea: Setting initial graduation from profile:', profile);
                setGraduation({
                    current_belt: profile.current_belt || 'Faixa Branca',
                    degrees: profile.degrees || 0,
                    start_date: profile.start_date || (profile as any).created_at,
                    next_forecast: (profile as any).next_graduation_date
                });
            }

            // Fetch Attendance
            console.log('📅 Fetching attendance for user:', userId);
            const { data: attData, error: attError } = await supabase
                .from('student_attendance')
                .select('*')
                .eq('user_id', userId);

            if (attError) {
                console.error('❌ Attendance fetch error:', attError);
                notification.alert(`Erro ao carregar presenças: ${attError.message}`, 'Erro');
            } else if (attData) {
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
                console.log('📊 Formatted attendance:', formattedAtt.length, 'records');
                setAttendance(formattedAtt);
            }

            // Fetch Graduation (History/Details)
            console.log('🎓 Fetching graduation data for user:', userId);
            const { data: gradDataArray, error: gradError } = await supabase
                .from('student_graduations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (gradError) {
                console.error('❌ Graduation fetch error:', gradError);
            } else if (gradDataArray && gradDataArray.length > 0) {
                const gradData = gradDataArray[0];
                console.log('✅ Found graduation record:', gradData);
                setGraduation(prev => ({
                    ...prev,
                    ...gradData,
                    current_belt: gradData.current_belt || profile?.current_belt || prev?.current_belt || 'Faixa Branca',
                    degrees: gradData.degrees ?? profile?.degrees ?? prev?.degrees ?? 0
                }));
            } else {
                console.log('ℹ️ No graduation records found, using profile data');
            }

            // Fetch Techniques
            const { data: techData } = await supabase
                .from('saved_techniques')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (techData) {
                setTechniques(techData as Technique[]);
            }

        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
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
            notification.alert('Não foi possível registrar sua presença agora.', 'Erro');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttendance = async (id: string) => {
        // Students shouldn't remove past attendance, only admins
        notification.alert('Por favor, solicite a remoção de presença ao seu professor.', 'Ação Restrita');
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
        <div className="w-full bg-gray-50 pt-20 sm:pt-24 lg:pt-40 pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Área do Aluno', icon: <UserIcon className="w-4 h-4" /> }
                        ]}
                    />
                </div>

                {/* Header */}
                <div className="bg-white shadow-sm rounded-2xl p-3 sm:p-6 mb-8 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-50 text-red-600 flex-shrink-0">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                                Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Visitante'}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3 mt-1">
                                <p className="text-gray-500 text-xs sm:text-sm font-medium">Bem-vindo à sua área exclusiva</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
                                    <span className="w-1 h-3 bg-gray-300 rounded-full hidden sm:block"></span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${(() => {
                                        const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                        if (belt.includes('white') || belt.includes('branca')) return 'bg-white border border-gray-200 text-gray-800';
                                        if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-600 text-white';
                                        if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-600 text-white';
                                        if (belt.includes('brown') || belt.includes('marrom')) return 'bg-amber-800 text-white';
                                        if (belt.includes('black') || belt.includes('preta')) return 'bg-black text-white';
                                        return 'bg-gray-100 text-gray-800';
                                    })()
                                        }`}>
                                        {graduation?.current_belt || 'Faixa Branca'} {graduation?.degrees !== undefined ? `- ${graduation.degrees}º Grau` : '- 0º Grau'}
                                    </span>
                                    {graduation?.next_forecast && (
                                        <span className="text-red-600 flex items-center gap-1 normal-case font-semibold text-[10px] sm:text-xs">
                                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden sm:inline">Próxima graduação: {new Date(graduation.next_forecast).toLocaleDateString('pt-BR')}</span>
                                            <span className="sm:hidden">{new Date(graduation.next_forecast).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100/50 shadow-sm transition-all hover:shadow-md w-full md:w-auto justify-end">
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all min-h-[44px]"
                                aria-label="Ir para painel administrativo"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Admin</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Weekly Curriculum Section */}
                <WeeklyCurriculum
                    currentBelt={graduation?.current_belt || 'Faixa Branca'}
                    defaultWeek={currentWeek}
                />

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
                            readOnly={true}
                            currentWeek={currentWeek}
                        />

                        {/* Training History & Stats */}
                        <TrainingHistory
                            attendanceData={attendance}
                            studentStartDate={graduation?.start_date || '2024-01-01'}
                            studentCategory={profile?.student_category || 'GB2'}
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
