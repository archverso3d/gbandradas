import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owcvysdtkvsdvaaakkyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_0L9GCeadcvE3m8LkVw6oaQ_lmDhTuHf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function recreateUser() {
    console.log("Recreating user lewmosconi@gmail.com...");

    // As we can't create Auth users without service role, we need to ask the user to sign up again, OR
    // If auth user still exists, we just need to recreate the profile.

    // First, let's check if the auth user exists by trying to sign in with a dummy password
    // This will error if the user exists but with a different password, which confirms they are in auth.users
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'lewmosconi@gmail.com',
        password: 'wrong_password_just_to_check'
    });

    console.log("Auth user status check:", signInError?.message);

    // We cannot insert into user_profiles without being that user or having service_role.
    // The RLS policy for user_profiles is:
    // create policy "Users can insert their own profile" on public.user_profiles for insert with check (auth.uid() = user_id);
    // So the user MUST log in to trigger the auto-creation trigger, OR we need the service role key.
}

recreateUser();
