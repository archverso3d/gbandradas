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
}

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
        const { data, error } = await supabase
            .from('saved_techniques')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Remove a specific attendance record
     */
    async removeAttendance(attendanceId: string) {
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
