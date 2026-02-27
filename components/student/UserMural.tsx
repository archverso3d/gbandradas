import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User as UserIcon, Users, Trophy, Star } from 'lucide-react';

export interface MuralProfile {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    current_belt: string | null;
    degrees?: number;
    student_category?: string;
    technique_count?: number;
    quiz_achievements?: string[];
}

interface UserMuralProps {
    currentUserId: string;
    onSelectUser: (userId: string, profile: MuralProfile) => void;
    selectedUserId: string;
}

export const UserMural: React.FC<UserMuralProps> = ({ currentUserId, onSelectUser, selectedUserId }) => {
    const [users, setUsers] = useState<MuralProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch all profiles. Note: RLS must allow this!
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id, full_name, avatar_url, current_belt, degrees, student_category, quiz_achievements')
                .order('full_name');

            if (localStorage.getItem('demo_mode') === 'true') {
                const demoId = localStorage.getItem('demo_user_id') || 'demo-user-me';

                let currentTechniqueCount = 7;
                let latestDemoUpdate = 0;

                try {
                    const demoTechsStr = localStorage.getItem('demo_saved_techniques');
                    if (demoTechsStr) {
                        const demoTechs = JSON.parse(demoTechsStr);
                        currentTechniqueCount = demoTechs.length;
                        if (demoTechs.length > 0) {
                            const maxTime = Math.max(...demoTechs.map((t: any) => t.created_at ? new Date(t.created_at).getTime() : 0));
                            latestDemoUpdate = maxTime > 0 ? maxTime : Date.now();
                        }
                    }
                } catch (e) {
                    console.error('Error reading demo techniques', e);
                }

                const mockUsers: any[] = [
                    { user_id: 'demo-1', full_name: 'Mestre Carlos', avatar_url: null, current_belt: 'Faixa Preta', technique_count: 12, latest_update: Date.now() - 100000, quiz_achievements: ['preta'] },
                    { user_id: 'demo-2', full_name: 'Ana Silva', avatar_url: null, current_belt: 'Faixa Azul', technique_count: 5, latest_update: Date.now() - 500000, quiz_achievements: ['azul'] },
                    { user_id: 'demo-3', full_name: 'Bruno Ramos', avatar_url: null, current_belt: 'Faixa Roxa', technique_count: 8, latest_update: Date.now() - 200000, quiz_achievements: ['roxa'] },
                    { user_id: 'demo-4', full_name: 'Carla Dias', avatar_url: null, current_belt: 'Faixa Marrom', technique_count: 3, latest_update: Date.now() - 800000, quiz_achievements: ['marrom'] },
                    { user_id: demoId, full_name: 'Admin', avatar_url: null, current_belt: 'Faixa Branca', technique_count: currentTechniqueCount, latest_update: latestDemoUpdate, quiz_achievements: [] }
                ];

                mockUsers.sort((a, b) => {
                    if (a.latest_update !== b.latest_update) {
                        return b.latest_update - a.latest_update;
                    }
                    return 0;
                });

                setUsers(mockUsers);
                setLoading(false);
                return;
            }

            if (error) {
                console.error('Error fetching users:', error);
            }

            if (data) {
                // Belt Order Mapping
                const beltRank: Record<string, number> = {
                    'black': 5, 'preta': 5,
                    'brown': 4, 'marrom': 4,
                    'purple': 3, 'roxa': 3,
                    'blue': 2, 'azul': 2,
                    'white': 1, 'branca': 1
                };

                const getRank = (belt: string | null) => {
                    if (!belt) return 0;
                    const b = belt.toLowerCase();
                    for (const [key, val] of Object.entries(beltRank)) {
                        if (b.includes(key)) return val;
                    }
                    return 0; // Unknown/None
                };

                // Fetch technique counts and latest updates for all users
                const { data: techCounts, error: techError } = await supabase
                    .from('saved_techniques')
                    .select('user_id, created_at');

                const countsMap: Record<string, number> = {};
                const latestUpdateMap: Record<string, number> = {};

                if (!techError && techCounts) {
                    techCounts.forEach((t: any) => {
                        countsMap[t.user_id] = (countsMap[t.user_id] || 0) + 1;
                        const time = new Date(t.created_at || 0).getTime();
                        if (!latestUpdateMap[t.user_id] || time > latestUpdateMap[t.user_id]) {
                            latestUpdateMap[t.user_id] = time;
                        }
                    });
                }

                // Filter to ensure we have valid users and add technique counts and latest update
                let sortedUsers = (data as MuralProfile[]).map(u => ({
                    ...u,
                    technique_count: countsMap[u.user_id] || 0,
                    latest_update: latestUpdateMap[u.user_id] || 0
                })) || [];

                // Sort by latest update (Desc), then Belt Rank (Desc), then Name (Asc)
                sortedUsers.sort((a: any, b: any) => {
                    if (a.latest_update !== b.latest_update) {
                        return b.latest_update - a.latest_update;
                    }
                    const rankA = getRank(a.current_belt);
                    const rankB = getRank(b.current_belt);

                    if (rankA !== rankB) return rankB - rankA; // Higher rank first
                    return (a.full_name || '').localeCompare(b.full_name || '');
                });

                setUsers(sortedUsers);
            }
        } catch (error) {
            console.error('Error fetching mural users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBeltColor = (belt: string | null) => {
        if (!belt) return { border: 'border-slate-200', text: 'text-slate-600', ring: 'ring-slate-200' };
        const b = belt.toLowerCase();
        if (b.includes('white') || b.includes('branca')) return { border: 'border-slate-100', text: 'text-slate-700', ring: 'ring-slate-100' };
        if (b.includes('blue') || b.includes('azul')) return { border: 'border-blue-500', text: 'text-blue-600', ring: 'ring-blue-200' };
        if (b.includes('purple') || b.includes('roxa')) return { border: 'border-purple-600', text: 'text-purple-600', ring: 'ring-purple-200' };
        if (b.includes('brown') || b.includes('marrom')) return { border: 'border-amber-700', text: 'text-amber-800', ring: 'ring-amber-200' };
        if (b.includes('black') || b.includes('preta')) return { border: 'border-slate-900', text: 'text-slate-900', ring: 'ring-slate-400' };
        return { border: 'border-slate-200', text: 'text-slate-600', ring: 'ring-slate-200' };
    };

    const formatBeltName = (belt: string | null) => {
        if (!belt) return 'GB';
        const b = belt.toLowerCase();
        if (b.includes('white') || b.includes('branca')) return 'Faixa Branca';
        if (b.includes('blue') || b.includes('azul')) return 'Faixa Azul';
        if (b.includes('purple') || b.includes('roxa')) return 'Faixa Roxa';
        if (b.includes('brown') || b.includes('marrom')) return 'Faixa Marrom';
        if (b.includes('black') || b.includes('preta')) return 'Faixa Preta';
        return belt;
    };

    if (loading) {
        return (
            <div className="mb-10 animate-pulse">
                <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                            <div className="h-3 w-12 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    // Only show if we have users (or at least the current user)
    if (users.length === 0) return null;

    const mostRecentUserId = users.length > 0 && users[0].technique_count && users[0].technique_count > 0 ? users[0].user_id : null;

    const renderProfile = (profile: MuralProfile) => {
        const isSelected = selectedUserId === profile.user_id;
        const isMe = currentUserId === profile.user_id;
        const isMostRecent = profile.user_id === mostRecentUserId;
        const colors = getBeltColor(profile.current_belt);

        return (
            <div
                key={profile.user_id}
                onClick={() => onSelectUser(profile.user_id, profile)}
                className={`flex flex-col items-center gap-2 cursor-pointer group min-w-[60px] snap-center transition-all duration-300 ${isSelected || isMostRecent ? 'scale-105 -translate-y-0.5' : 'opacity-60 hover:opacity-100 hover:-translate-y-0.5'}`}
            >
                <div className={`relative transition-all duration-300 ${isSelected || isMostRecent ? 'drop-shadow-md' : 'drop-shadow-sm group-hover:drop-shadow-md'}`}>
                    {/* Outline Ring */}
                    <div className={`absolute -inset-1 rounded-full border-2 ${isSelected ? 'border-red-500 scale-110' : isMostRecent ? 'border-orange-400 scale-105 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse' : 'border-transparent group-hover:border-slate-200'} transition-all duration-300`}></div>

                    {/* Technique Count Badge */}
                    {profile.technique_count && profile.technique_count > 0 ? (
                        <div className="absolute -top-1 -left-1 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full z-20 shadow-sm border border-white animate-in zoom-in duration-300">
                            {profile.technique_count}
                        </div>
                    ) : null}

                    {/* Avatar Container */}
                    <div className={`w-12 h-12 rounded-full border-2 ${colors.border} p-0.5 bg-white overflow-hidden relative z-0`}>
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name || 'User'}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <UserIcon className="w-6 h-6" />
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    {isMe ? (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 tracking-widest shadow-sm border border-white">
                            VOCÊ
                        </div>
                    ) : isMostRecent ? (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm z-30 uppercase tracking-widest shadow-[0_2px_4px_rgba(239,68,68,0.4)] border border-white whitespace-nowrap animate-pulse">
                            NOVO
                        </div>
                    ) : null}

                    {!isMe && profile.current_belt && profile.current_belt.toLowerCase().includes('black') && (
                        <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 rounded-full p-1 z-10 shadow-sm border border-white" title="Faixa Preta">
                            <Trophy className="w-2.5 h-2.5" />
                        </div>
                    )}

                    {/* Quiz Stars */}
                    {profile.quiz_achievements && profile.quiz_achievements.length > 0 && (
                        <div className="absolute -right-1 -bottom-1 flex -space-x-1 z-20 drop-shadow-sm">
                            {profile.quiz_achievements.map((belt, idx) => (
                                <Star
                                    key={belt}
                                    className={`w-3 h-3 fill-amber-400 text-amber-500 border border-white rounded-full bg-white p-[1px]`}
                                    style={{ zIndex: 10 - idx }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center transition-all">
                    <p className={`text-[10px] font-bold truncate max-w-[64px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {profile.full_name?.split(' ')[0] || 'Aluno'}
                    </p>
                    <p className={`text-[8px] font-bold uppercase tracking-wider ${colors.text} opacity-80 whitespace-nowrap`}>
                        {formatBeltName(profile.current_belt).replace('Faixa ', '')}
                    </p>
                </div>
            </div>
        );
    };

    const currentUserProfile = users.find(u => u.user_id === currentUserId);
    const otherUsers = users.filter(u => u.user_id !== currentUserId);

    return (
        <div id="community-mural" className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest italic flex items-center gap-2 drop-shadow-sm">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Comunidade
                </h3>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    {users.length} Alunos
                </span>
            </div>

            <div className="relative">
                {/* Scroll Fade Effects */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-50 dark:from-[#0F172A] to-transparent z-10 pointer-events-none md:hidden"></div>
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-50 dark:from-[#0F172A] to-transparent z-10 pointer-events-none md:hidden"></div>

                <div className="flex gap-4 overflow-x-auto pb-6 pt-4 px-4 scrollbar-hide snap-x scroll-pl-4">
                    {currentUserProfile && renderProfile(currentUserProfile)}

                    {currentUserProfile && otherUsers.length > 0 && (
                        <div className="flex items-center justify-center shrink-0 px-2 pb-6">
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                    )}

                    {otherUsers.map(profile => renderProfile(profile))}
                </div>
            </div>
        </div>
    );
};
