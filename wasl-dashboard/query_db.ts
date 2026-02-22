import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
  const { data, error } = await supabase.rpc('get_schema_info'); // if this exists
  // instead, just fetch a row from units
  const { data: units, error: err } = await supabase.from('units').select('*').limit(1);
  console.log(JSON.stringify(units?.[0]));
}
main();
