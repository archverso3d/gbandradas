import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owcvysdtkvsdvaaakkyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_0L9GCeadcvE3m8LkVw6oaQ_lmDhTuHf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
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
        console.log("User not found by email, checking all user_profiles for lewmosconi");
        const { data: allUsers, error: err3 } = await supabase.from('user_profiles').select('*').ilike('email', '%lewmosconi%');
        if (err3) console.error("Error all users:", err3);
        else console.log("All matching users:", allUsers);

        console.log("Checking total saved_techniques count...");
        const { count, error: err4 } = await supabase.from('saved_techniques').select('*', { count: 'exact', head: true });
        console.log("Total saved techniques in DB:", count);
    }
}

check();
