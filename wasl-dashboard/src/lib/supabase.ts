
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Debug Supabase Config ---');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase connections strings. Check .env file.');
}

const url = supabaseUrl || '';
const key = supabaseKey || '';

export const supabase = createClient(url, key);
