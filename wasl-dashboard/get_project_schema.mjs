import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
dotenv.config({ path: '.env', override: false });

async function main() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  const projectsTable = spec.definitions.projects;
  console.log("PROJECT COLUMNS:", Object.keys(projectsTable.properties));
}
main();
