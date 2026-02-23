import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owcvysdtkvsdvaaakkyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_0L9GCeadcvE3m8LkVw6oaQ_lmDhTuHf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSettings() {
    await supabase.auth.signUp({
        email: `test_settings_${Date.now()}@example.com`,
        password: 'password123'
    });

    const { data } = await supabase.from('app_settings').select('*');
    fs.writeFileSync('settings_output.json', JSON.stringify(data, null, 2));
}

checkSettings();
