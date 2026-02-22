
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking Projects Facilities...");
    // Limit to 5 projects
    const { data: projects, error } = await supabase
        .from('projects')
        .select('project_name, facilities')
        .limit(5);

    if (error) {
        console.error("Error fetching projects:", error);
        return;
    }

    if (!projects || projects.length === 0) {
        console.log("No projects found.");
        return;
    }

    console.log(`Found ${projects.length} projects.`);
    projects.forEach(p => {
        const fac = p.facilities;
        console.log(`- ${p.project_name}:`);
        console.log(`  Value: ${JSON.stringify(fac)}`);
        console.log(`  Type: ${typeof fac}`);
        if (Array.isArray(fac)) {
            console.log("  Is Array: Yes");
        } else {
            console.log("  Is Array: No");
        }
    });
}

checkData().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
