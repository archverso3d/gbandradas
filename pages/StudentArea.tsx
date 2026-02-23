import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { GraduationCard } from '../components/student/GraduationCard';
import { CalendarComponent } from '../components/CalendarComponent';
import { TechniqueVault } from '../components/student/TechniqueVault';
import { WeeklyCurriculum } from '../components/student/WeeklyCurriculum';
import { TrainingHistory } from '../components/student/TrainingHistory';
import { TechniqueHistory } from '../components/student/TechniqueHistory';
import { TrainingFocusChart } from '../components/student/TrainingFocusChart';
import { LogOut, User as UserIcon, Settings, Calendar, ArrowUp } from 'lucide-react';
import { adminService } from '../services/admin';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getCurrentCurriculumWeek, getClassLabelByDay } from '../utils/curriculum';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { UserMural, MuralProfile } from '../components/student/UserMural';
import { InstructionBalloon } from '../components/ui/InstructionBalloon';

const BELTS = [
    'Faixa Branca',
    'Faixa Azul',
    'Faixa Roxa',
    'Faixa Marrom',
    'Faixa Preta',
    'Faixa Coral',
    'Faixa Vermelha'
];

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
    likes_count?: number;
    is_liked?: boolean;
}

const StudentArea: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user, profile, isAdmin, signOut, refreshProfile, loading: authLoading } = useAuth();

    // Data States
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [graduation, setGraduation] = useState<Graduation | null>(null);
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [selectedMuralUser, setSelectedMuralUser] = useState<MuralProfile | null>(null);
    const [currentWeek, setCurrentWeek] = useState<number>(getCurrentCurriculumWeek());
    const [techniqueLinks, setTechniqueLinks] = useState<Record<string, string>>({});
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
                // Load technique links for curriculum
                adminService.getTechniqueLinks().then(setTechniqueLinks).catch(console.error);
            }
        }
    }, [user, authLoading, navigate, profile]); // Added profile to dependencies

    const fetchData = async (userId: string, isPeer: boolean = false, peerProfile?: MuralProfile) => {
        setLoading(true);
        try {
            // Fetch Profile/Graduation if it's a peer
            let activeGraduation: Graduation | null = null;
            let activeStudentCategory: string = 'GB2';

            if (isPeer) {
                console.log('👥 Fetching peer profile data for:', userId);

                // Allow using peer profile from mural if DB fetch fails (e.g., demo mock users)
                const fallbackGraduation: Graduation = {
                    current_belt: peerProfile?.current_belt || 'Faixa Branca',
                    degrees: peerProfile?.degrees || 0,
                    start_date: '2024-01-01',
                    student_category: peerProfile?.student_category || 'GB2'
                };

                if (localStorage.getItem('demo_mode') === 'true' && userId.startsWith('demo-')) {
                    activeGraduation = fallbackGraduation;
                    setGraduation(activeGraduation);
                } else {
                    const { data: profileData, error: profileError } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('user_id', userId)
                        .single();

                    if (profileError) {
                        console.error('❌ Peer profile fetch error:', profileError);
                        activeGraduation = peerProfile ? fallbackGraduation : null;
                    } else if (profileData) {
                        activeGraduation = {
                            current_belt: profileData.current_belt || 'Faixa Branca',
                            degrees: profileData.degrees || 0,
                            start_date: profileData.start_date || profileData.created_at,
                            next_forecast: profileData.next_graduation_date,
                            student_category: profileData.student_category || 'GB2'
                        };
                    }

                    setGraduation(activeGraduation);

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
                            current_belt: gradData.current_belt || prev?.current_belt || activeGraduation?.current_belt || 'Faixa Branca',
                            degrees: gradData.degrees ?? prev?.degrees ?? activeGraduation?.degrees ?? 0
                        }));
                    }
                }
            } else if (profile) {
                activeGraduation = {
                    current_belt: profile.current_belt || 'Faixa Branca',
                    degrees: profile.degrees || 0,
                    start_date: profile.start_date || (profile as any).created_at,
                    next_forecast: (profile as any).next_graduation_date,
                    student_category: profile.student_category || 'GB2'
                };
                setGraduation(activeGraduation);
            }

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

        // Seed graduation state to prevent UI flicker
        setGraduation({
            current_belt: profileSelected.current_belt || 'Faixa Branca',
            degrees: profileSelected.degrees || 0, // Fallback, will be updated by fetchData
            start_date: '2024-01-01',
            student_category: profileSelected.student_category || 'GB2'
        } as Graduation);

        if (userId === user?.id) {
            setSelectedMuralUser(null);
            fetchData(user.id, false);
        } else {
            setSelectedMuralUser(profileSelected);
            fetchData(userId, true, profileSelected);
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
    const handleToggleLike = async (techniqueId: string, isLiked: boolean) => {
        // Optimistic update
        setTechniques(prev => prev.map(t => {
            if (t.id === techniqueId) {
                return {
                    ...t,
                    is_liked: !isLiked,
                    likes_count: (t.likes_count || 0) + (isLiked ? -1 : 1)
                };
            }
            return t;
        }));

        try {
            await adminService.toggleLike(techniqueId, isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setTechniques(prev => prev.map(t => {
                if (t.id === techniqueId) {
                    return {
                        ...t,
                        is_liked: isLiked,
                        likes_count: (t.likes_count || 0)
                    };
                }
                return t;
            }));
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateGraduation = async (updates: Partial<Graduation>) => {
        if (!user?.id || selectedMuralUser) return;

        // Optimistic update
        const previousGraduation = graduation;
        setGraduation(prev => prev ? { ...prev, ...updates } : null);

        try {
            await adminService.updateStudentDetails(user.id, updates);
            await refreshProfile();
        } catch (error: any) {
            console.error('Error updating graduation:', error);
            notification.alert('Erro ao atualizar graduação', 'Erro');
            setGraduation(previousGraduation);
        }
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

                <div className="mb-8 relative">
                    {/* The Balloon - Outside of overflow-hidden container */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[110]">
                        <div className="relative w-full md:w-[400px] h-full mx-auto md:mx-0">
                            <InstructionBalloon
                                id="graduation-info"
                                text="Aqui você acompanha e atualiza sua graduação. Clique para trocar de faixa ou adicionar graus!"
                                position="bottom"
                                className="!pointer-events-auto"
                            />
                        </div>
                    </div>

                    <div className={`shadow-2xl rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group min-h-[120px] sm:min-h-[140px] ${(() => {
                        const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                        if (belt.includes('white') || belt.includes('branca')) return 'bg-white dark:bg-slate-100 border-slate-200';
                        if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-700 border-blue-800';
                        if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-800 border-purple-900 text-white';
                        if (belt.includes('brown') || belt.includes('marrom')) return 'bg-[#5D4037] border-[#4E342E] text-white';
                        if (belt.includes('black') || belt.includes('preta')) return 'bg-slate-900 border-slate-950 text-white';
                        if (belt.includes('coral')) return 'bg-gradient-to-r from-red-600 via-black to-red-600 border-red-900 text-white';
                        if (belt.includes('vermelha')) return 'bg-red-700 border-red-800 text-white';
                        return 'bg-[#0F172A] border-slate-800 text-white';
                    })()}`}>

                        {/* Belt Weave Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.5) 1px, transparent 0)`, backgroundSize: '4px 4px' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 pointer-events-none"></div>


                        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto p-5 sm:p-6 relative z-10">
                            <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 shadow-xl group-hover:scale-105 transition-all duration-500 overflow-hidden ring-4 ${(() => {
                                const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                if (belt.includes('white') || belt.includes('branca')) return 'bg-white border-slate-200 ring-slate-100 dark:ring-slate-200';
                                return 'bg-white/10 border-white/20 ring-black/10';
                            })()}`}>
                                {(() => {
                                    const avatarUrl = selectedMuralUser ? selectedMuralUser.avatar_url : user?.user_metadata?.avatar_url;
                                    if (avatarUrl) {
                                        return (
                                            <img
                                                src={avatarUrl}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        );
                                    }
                                    return <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />;
                                })()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className={`text-2xl sm:text-4xl font-black italic tracking-tighter truncate drop-shadow-md ${(() => {
                                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                    if (belt.includes('white') || belt.includes('branca')) return 'text-slate-900';
                                    return 'text-white';
                                })()}`}>
                                    {selectedMuralUser ? `${selectedMuralUser.full_name?.split(' ')[0]}` : `${user?.user_metadata?.full_name?.split(' ')[0] || 'Visitante'}`}
                                </h1>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-1">
                                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] italic opacity-70 ${(() => {
                                        const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                        if (belt.includes('white') || belt.includes('branca')) return 'text-slate-600';
                                        return 'text-white';
                                    })()}`}>BEM-VINDO À SUA ÁREA EXCLUSIVA</p>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        {/* Inline Belt Selector */}
                                        <div className="relative group/select">
                                            <select
                                                disabled={!!selectedMuralUser}
                                                value={graduation?.current_belt || 'Faixa Branca'}
                                                onChange={(e) => handleUpdateGraduation({ current_belt: e.target.value })}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duo-btn-3d appearance-none cursor-pointer pr-8 outline-none ${(() => {
                                                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                                    if (belt.includes('white') || belt.includes('branca')) return 'bg-white text-slate-800 shadow-[0_3px_0_0_#e2e8f0]';
                                                    if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-600 text-white shadow-[0_3px_0_0_#1d4ed8]';
                                                    if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-600 text-white shadow-[0_3px_0_0_#6d28d9]';
                                                    if (belt.includes('brown') || belt.includes('marrom')) return 'bg-[#4E342E] text-white shadow-[0_3px_0_0_#3e2723]';
                                                    if (belt.includes('black') || belt.includes('preta')) return 'bg-slate-800 text-white shadow-[0_3px_0_0_#1e293b]';
                                                    return 'bg-slate-700 text-white shadow-[0_3px_0_0_#334155]';
                                                })()} ${selectedMuralUser ? 'cursor-default pointer-events-none pr-3' : 'hover:scale-105 active:scale-95'}`}
                                            >
                                                {BELTS.map(b => (
                                                    <option key={b} value={b} className="text-slate-900 bg-white">{b}</option>
                                                ))}
                                            </select>
                                            {!selectedMuralUser && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline Degree Selector */}
                                        <div className="relative group/select">
                                            <select
                                                disabled={!!selectedMuralUser}
                                                value={graduation?.degrees || 0}
                                                onChange={(e) => handleUpdateGraduation({ degrees: parseInt(e.target.value) })}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duo-btn-3d appearance-none cursor-pointer pr-8 outline-none ${(() => {
                                                    const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                                    if (belt.includes('white') || belt.includes('branca')) return 'bg-white text-slate-800 shadow-[0_3px_0_0_#e2e8f0]';
                                                    if (belt.includes('blue') || belt.includes('azul')) return 'bg-blue-600 text-white shadow-[0_3px_0_0_#1d4ed8]';
                                                    if (belt.includes('purple') || belt.includes('roxa')) return 'bg-purple-600 text-white shadow-[0_3px_0_0_#6d28d9]';
                                                    if (belt.includes('brown') || belt.includes('marrom')) return 'bg-[#4E342E] text-white shadow-[0_3px_0_0_#3e2723]';
                                                    if (belt.includes('black') || belt.includes('preta')) return 'bg-slate-800 text-white shadow-[0_3px_0_0_#1e293b]';
                                                    return 'bg-slate-700 text-white shadow-[0_3px_0_0_#334155]';
                                                })()} ${selectedMuralUser ? 'cursor-default pointer-events-none pr-3' : 'hover:scale-105 active:scale-95'}`}
                                            >
                                                {[0, 1, 2, 3, 4].map(d => (
                                                    <option key={d} value={d} className="text-slate-900 bg-white">{d}º Grau</option>
                                                ))}
                                            </select>
                                            {!selectedMuralUser && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Belt Tip (Ponteira) & Stripes Section */}
                        <div className="flex flex-col md:flex-row items-center gap-3 relative z-10 w-full md:w-auto h-full px-5 pb-5 md:pb-0 md:pr-0 self-stretch">
                            <div className="flex items-center gap-2 self-start md:self-center">
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
                        </div>

                        {/* The Actual Belt Tip (Physical Representation) */}
                        <div className="hidden md:flex items-stretch relative pointer-events-none self-stretch">
                            {/* Ponteira (Tip) Container - straight vertical block at end of belt */}
                            <div className={`relative flex items-center h-full min-h-[120px] w-32 sm:w-40 border-l-4 border-black/30 ${(() => {
                                const belt = (graduation?.current_belt || 'Faixa Branca').toLowerCase();
                                if (belt.includes('black') || belt.includes('preta')) return 'bg-red-700';
                                return 'bg-slate-950';
                            })()}`}>
                                {/* Degree Stripes (Graus) - vertical white bars */}
                                <div className="flex gap-3 sm:gap-4 items-center justify-center w-full h-full px-4">
                                    {Array.from({ length: graduation?.degrees || 0 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-[10px] sm:w-[14px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] border-x border-black/5 animate-in fade-in zoom-in duration-300"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Degrees Display */}
                        <div className="md:hidden flex items-center gap-1.5 absolute right-4 bottom-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            {Array.from({ length: graduation?.degrees || 0 }).map((_, i) => (
                                <div key={i} className="w-1.5 h-6 bg-white rounded-full shadow-lg" />
                            ))}
                            <span className="text-[10px] font-black text-white ml-1 uppercase">{graduation?.degrees || 0}º GRAU</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <WeeklyCurriculum
                        currentBelt={graduation?.current_belt || 'Faixa Branca'}
                        defaultWeek={currentWeek}
                        techniqueLinks={techniqueLinks}
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

                        {/* Training Focus Chart */}
                        <TrainingFocusChart
                            attendanceData={attendance}
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
                            onToggleLike={handleToggleLike}
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
