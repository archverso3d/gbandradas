import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owcvysdtkvsdvaaakkyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_0L9GCeadcvE3m8LkVw6oaQ_lmDhTuHf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    // 1. Sign up a temporary user to get `authenticated` role
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123'
    });

    if (authErr) {
        console.error("Sign up error (might already exist or be disabled):", authErr);
    } else {
        console.log("Signed up/in as:", testEmail);
    }

    // Now we are authenticated. Let's query.
    console.log("Checking user_profiles...");
    const { data: users, error: err1 } = await supabase.from('user_profiles').select('*').eq('email', 'lewmosconi@gmail.com');
    if (err1) console.error("Error users:", err1);
    else console.log("Users:", users);

    let userId = users?.[0]?.user_id;
    if (userId) {
        console.log("Checking saved_techniques for userId:", userId);
        const { data: techs, error: err2 } = await supabase.from('saved_techniques').select('*').eq('user_id', userId);
        if (err2) console.error("Error techs:", err2);
        else console.log("Techs count:", techs?.length);
    } else {
        console.log("User not found by email. Total profiles search...");
        const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        console.log("Total user_profiles (authenticated):", userCount);

        console.log("Checking total saved_techniques count...");
        const { count, error: err4 } = await supabase.from('saved_techniques').select('*', { count: 'exact', head: true });
        console.log("Total saved techniques in DB (authenticated):", count);
    }
}

check();
