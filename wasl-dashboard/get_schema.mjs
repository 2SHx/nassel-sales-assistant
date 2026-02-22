import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  const unitsTable = spec.definitions.units;
  console.log("UNIT COLUMNS:", Object.keys(unitsTable.properties));
}
main();
