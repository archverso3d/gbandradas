import { supabase } from './supabaseClient';

export interface StudentProfile {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    role: string;
    current_belt: string;
    degrees: number;
    next_graduation_date: string | null;
    start_date: string | null;
    phone: string | null;
    student_category: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
}

// Helper to check if we are in demo mode
const isDemoMode = () => localStorage.getItem('demo_mode') === 'true';

// Helper for Mock Data persistence
const getMockData = (key: string) => JSON.parse(localStorage.getItem(`demo_data_${key}`) || '[]');
const saveMockData = (key: string, data: any) => localStorage.setItem(`demo_data_${key}`, JSON.stringify(data));

export const adminService = {
    /**
     * Fetch all student profiles
     */
    async getAllStudents() {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return data as StudentProfile[];
    },

    /**
     * Update student graduation details
     */
    async updateStudentDetails(userId: string, updates: Partial<StudentProfile>) {
        if (isDemoMode()) {
            console.log('🚀 [DEMO] Updating student details locally');
            const profileStr = localStorage.getItem('demo_profile');
            if (profileStr) {
                const currentProfile = JSON.parse(profileStr);
                const updatedProfile = { ...currentProfile, ...updates };
                localStorage.setItem('demo_profile', JSON.stringify(updatedProfile));
            }
            return;
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    /**
     * Mark attendance for a student on a specific date
     */
    async markAttendance(userId: string, weekNumber?: number, classLabel?: string, date: Date = new Date()) {
        if (isDemoMode()) {
            console.log('📝 [DEMO] Marking attendance locally');
            const attendance = getMockData('attendance');
            const newRecord = {
                id: Math.random().toString(36).substr(2, 9),
                user_id: userId,
                checkin_at: date.toISOString(),
                status: 'present',
                week_number: weekNumber,
                class_label: classLabel
            };
            saveMockData('attendance', [newRecord, ...attendance]);
            return;
        }

        const { error } = await supabase
            .rpc('register_attendance_json_v11', {
                payload: {
                    user_id: userId,
                    week_number: weekNumber,
                    class_label: classLabel,
                    checkin_at: date.toISOString()
                }
            });

        if (error) throw error;
    },

    /**
     * Bulk mark attendance for multiple students
     */
    async batchMarkAttendance(userIds: string[], weekNumber: number, classLabel: string) {
        const { data, error } = await supabase
            .rpc('batch_attendance_json_v11', {
                payload: {
                    user_ids: userIds,
                    week_number: weekNumber,
                    class_label: classLabel,
                    checkin_at: new Date().toISOString()
                }
            });

        if (error) throw error;
        return data;
    },

    /**
     * Get attendance for a specific student (for the admin view)
     */
    async getStudentAttendance(userId: string) {
        if (isDemoMode()) {
            const attendance = getMockData('attendance');
            return attendance.filter((a: any) => a.user_id === userId);
        }

        const { data, error } = await supabase
            .from('student_attendance')
            .select('*')
            .eq('user_id', userId)
            .order('checkin_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get saved techniques for a specific student
     */
    async getSavedTechniques(userId: string) {
        if (isDemoMode()) {
            const techniques = getMockData('techniques');
            const likes = getMockData('technique_likes');
            const currentUserId = localStorage.getItem('demo_user_id') || 'demo-user-me';

            return techniques
                .filter((t: any) => t.user_id === userId)
                .map((t: any) => ({
                    ...t,
                    likes_count: likes.filter((l: any) => l.technique_id === t.id).length,
                    is_liked: likes.some((l: any) => l.technique_id === t.id && l.user_id === currentUserId)
                }));
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('saved_techniques')
            .select(`
                *,
                likes_count:technique_likes(count),
                is_liked:technique_likes!left(user_id)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Formatar os dados para simplificar o uso no frontend
        return data.map((t: any) => ({
            ...t,
            likes_count: t.likes_count?.[0]?.count || 0,
            is_liked: t.is_liked?.some((l: any) => l.user_id === user?.id) || false
        }));
    },

    /**
     * Toggle like for a technique
     */
    async toggleLike(techniqueId: string, isLiked: boolean) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        if (isDemoMode()) {
            console.log(`👍 [DEMO] ${isLiked ? 'Unliking' : 'Liking'} technique locally`);
            const likes = getMockData('technique_likes');
            if (isLiked) {
                const filtered = likes.filter((l: any) => !(l.technique_id === techniqueId && l.user_id === user.id));
                saveMockData('technique_likes', filtered);
            } else {
                const newLike = {
                    id: Math.random().toString(36).substr(2, 9),
                    user_id: user.id,
                    technique_id: techniqueId,
                    created_at: new Date().toISOString()
                };
                saveMockData('technique_likes', [newLike, ...likes]);
            }
            return;
        }

        if (isLiked) {
            const { error } = await supabase
                .from('technique_likes')
                .delete()
                .match({ user_id: user.id, technique_id: techniqueId });
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('technique_likes')
                .insert([{ user_id: user.id, technique_id: techniqueId }]);
            if (error) throw error;
        }
    },

    /**
     * Remove a specific attendance record
     */
    async removeAttendance(attendanceId: string) {
        if (isDemoMode()) {
            const attendance = getMockData('attendance');
            const filtered = attendance.filter((a: any) => a.id !== attendanceId);
            saveMockData('attendance', filtered);
            return;
        }

        const { error } = await supabase
            .from('student_attendance')
            .delete()
            .eq('id', attendanceId);

        if (error) throw error;
    },

    /**
     * Get a specific app setting
     */
    async getSetting(key: string) {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data.value;
    },

    /**
     * Update an app setting
     */
    async updateSetting(key: string, value: any) {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;
    },

    /**
     * Get technique links map (technique number -> URL)
     */
    async getTechniqueLinks(): Promise<Record<string, string>> {
        const migrateLinks = (obj: any): Record<string, string> => {
            if (!obj) return {};
            const migrated: Record<string, string> = {};
            let changed = false;
            Object.entries(obj).forEach(([k, v]) => {
                if (/^\d+$/.test(k)) {
                    migrated[`gb1_${k}`] = v as string;
                    changed = true;
                } else {
                    migrated[k] = v as string;
                }
            });
            if (changed) {
                this.updateTechniqueLinks(migrated).catch(console.error);
            }
            return migrated;
        };

        if (isDemoMode()) {
            try {
                // Tenta carregar da versão web (Supabase) mesmo estando no ambiente local/demo
                const value = await this.getSetting('technique_links');
                if (value) {
                    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                    const migrated = migrateLinks(parsedValue);
                    // Atualiza o cache local com os dados mais recentes do web
                    saveMockData('demo_technique_links', migrated);
                    return migrated;
                }
            } catch (error) {
                console.log('Aviso: Não foi possível carregar da versão web, usando cache local', error);
            }
            // Fallback para o cache local
            return migrateLinks(getMockData('demo_technique_links') || {});
        }
        try {
            const value = await this.getSetting('technique_links');
            return migrateLinks(value ? (typeof value === 'string' ? JSON.parse(value) : value) : {});
        } catch (e) {
            console.error('Error fetching technique links:', e);
            return {};
        }
    },

    /**
     * Update technique links map
     */
    async updateTechniqueLinks(links: Record<string, string>) {
        if (isDemoMode()) {
            saveMockData('demo_technique_links', links);
            try {
                // Tenta salvar na versão web (Supabase) mesmo estando no ambiente local/demo
                await this.updateSetting('technique_links', links);
            } catch (error) {
                console.log('Aviso: Não foi possível sincronizar com a versão web', error);
            }
            return;
        }
        await this.updateSetting('technique_links', links);
    },

    /**
     * Delete a student profile (Soft Delete)
     */
    async deleteStudent(userId: string) {
        if (isDemoMode()) {
            console.log('🗑️ [DEMO] Soft Deleting student locally');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        // Fazemos o soft delete atualizando o 'deleted_at'
        const { error } = await supabase
            .from('user_profiles')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: user?.id
            })
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Restore a soft-deleted student profile (Remove from Limbo)
     */
    async restoreStudent(userId: string) {
        if (isDemoMode()) {
            console.log('♻️ [DEMO] Restoring student locally');
            return;
        }

        const { error } = await supabase
            .from('user_profiles')
            .update({
                deleted_at: null,
                deleted_by: null
            })
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Permanently delete a student profile (Hard Delete)
     */
    async permanentlyDeleteStudent(userId: string) {
        if (isDemoMode()) {
            console.log('🔥 [DEMO] Hard deleting student locally');
            return;
        }

        // Deletar os dados dependentes (mesmo com CASCADE configurado, é bom garantir)
        await supabase.from('student_attendance').delete().eq('user_id', userId);
        await supabase.from('technique_likes').delete().eq('user_id', userId);
        await supabase.from('saved_techniques').delete().eq('user_id', userId);

        // Deleta o perfil do usuário permanentemente
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Check if current user is admin
     */
    async isAdmin() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (error || !data) return false;
            return data.role === 'admin';
        } catch (err) {
            console.error('Error in isAdmin check:', err);
            return false;
        }
    }
};
