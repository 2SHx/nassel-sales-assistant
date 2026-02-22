import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

function cleanNumber(str: string | undefined): number {
    if (!str) return 0;
    // Handle Arabic comma, thousands separator, and percent signs
    const cleaned = str.replace(/%/g, '').replace(/٬/g, '').replace(/٫/g, '.').replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function parseDate(str: string | undefined): string | null {
    if (!str) return null;
    const parts = str.trim().split('/');
    if (parts.length === 3) {
        // Expected format: DD/MM/YYYY
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(d.valueOf())) return d.toISOString();
    }
    return null;
}

async function seed() {
    console.log('Starting seed process...');
    const projectsCsvPath = '/Users/mac/Desktop/Sales assistant/Projects.csv';
    const unitsCsvPath = '/Users/mac/Desktop/Sales assistant/Units.csv';

    console.log('Reading Projects.csv...');
    const projectsCsv = fs.readFileSync(projectsCsvPath, 'utf8');
    const parsedProjects = Papa.parse(projectsCsv, {
        header: true,
        skipEmptyLines: true,
    });

    const projectIdMap = new Map<string, string>(); // Maps CSV 'معرف المشروع' to Supabase UUID

    console.log(`Found ${parsedProjects.data.length} projects. Inserting...`);

    for (const row of parsedProjects.data as any[]) {
        const csvId = row['معرف المشروع'];
        if (!csvId) continue;

        const projectData = {
            project_code: row['كود المشروع'] || '',
            developer: row['المطور'] || '',
            project_number: cleanNumber(row['رقم المشروع']),
            project_name: row['المشروع'] || '',
            project_status: row['حالة المشروع'] || 'متاح',
            project_type: row['نوع المشروع'] || '',
            unit_types: row['انواع الوحدات'] || '',
            opening_date: parseDate(row['موعد إفتتاح المشروع']),
            location_url: row['الموقع'] || '',
            direction: row['الإتجاه'] || '',
            country: row['الدولة'] || '',
            city: row['المدينة'] || '',
            district: row['الحي'] || '',
            facilities: row['المرافق'] ? row['المرافق'].split(',').map((s: string) => s.trim()) : [],
            marketing_pitch: row['رسالة المشروع'] || '',
            manychat: row['manychat'] === 'تم الإنشاء',
            total_units: cleanNumber(row['عدد الوحدات']),
            available_units: cleanNumber(row['عدد الوحدات المتاحة']),
            under_construction_units: cleanNumber(row['عدد الوحدات تحت الإنشاء']),
            reserved_units: cleanNumber(row['عدد الوحدات المحجوزة']),
            sold_units: cleanNumber(row['عدد الوحدات المباعة']),
            avg_unit_price: cleanNumber(row['متوسط قيمة الوحدة']),
            avg_available_unit_price: cleanNumber(row['متوسط قيمة الوحدات المتاحة']),
            total_project_value: cleanNumber(row['إجمالي قيمة المشروع']),
            sold_percentage: cleanNumber(row['نسبة بيع المشروع']),
            total_under_construction_value: cleanNumber(row['إجمالي قيمة تحت الإنشاء']),
            total_available_value: cleanNumber(row['إجمالي قيمة المتاح']),
            total_reserved_value: cleanNumber(row['إجمالي قيمة المحجوز']),
            total_sold_value: cleanNumber(row['إجمالي قيمة المباع']),
            min_price: cleanNumber(row['السعر الأدنى']),
            min_available_price: cleanNumber(row['السعر الأدنى المتاح']),
            max_price: cleanNumber(row['السعر الأقصى']),
            max_available_price: cleanNumber(row['السعر الأقصى المتاح']),
            price_range: row['نطاق السعر'] || '',
            available_price_range: row['نطاق السعر المتاح'] || '',
            min_area: cleanNumber(row['المساحة الأدنى']),
            min_available_area: cleanNumber(row['المساحة الأدنى المتاحة']),
            max_area: cleanNumber(row['المساحة الأقصى']),
            max_available_area: cleanNumber(row['المساحة الأقصى المتاحة']),
            area_range: row['نطاق المساحة'] || '',
            available_area_range: row['نطاق المساحة المتاحة'] || '',
            min_bedrooms: cleanNumber(row['عدد ادنى غرف نوم']),
            min_available_bedrooms: cleanNumber(row['عدد ادنى غرف نوم المتاحة']),
            max_bedrooms: cleanNumber(row['عدد اقصى غرف نوم']),
            max_available_bedrooms: cleanNumber(row['عدد اقصى غرف نوم متاحة']),
            bedrooms_range: row['نطاق غرف النوم'] || '',
            available_bedrooms_range: row['نطاق غرف النوم المتاحة'] || '',
            min_bathrooms: cleanNumber(row['عدد ادنى حمامات ']),
            min_available_bathrooms: cleanNumber(row['عدد ادنى حمامات متاحة']),
            max_bathrooms: cleanNumber(row['عدد اقصى حمامات']),
            max_available_bathrooms: cleanNumber(row['عدد اقصى حمامات متاحة']),
            bathrooms_range: row['نطاق الحمامات'] || '',
            available_bathrooms_range: row['نطاق الحمامات المتاحة'] || ''
        };

        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select('id')
            .single();

        if (error) {
            console.error(`Error inserting project ${csvId}:`, error);
        } else if (data) {
            projectIdMap.set(csvId, data.id);
            console.log(`Inserted project ${projectData.project_name} -> ID: ${data.id}`);
        }
    }

    console.log('Reading Units.csv...');
    const unitsCsv = fs.readFileSync(unitsCsvPath, 'utf8');
    // Units.csv has a duplicate column visually in the snippet: ",مكونات الوحدة,,مساحة الفناء,"
    // Papa parse will handle empty headers by making them named empty string.
    const parsedUnits = Papa.parse(unitsCsv, {
        header: true,
        skipEmptyLines: true,
    });

    console.log(`Found ${parsedUnits.data.length} units. Inserting in batches...`);

    const unitBatch = [];
    for (const row of parsedUnits.data as any[]) {
        const csvProjectId = row['معرف المشروع'];
        if (!csvProjectId) continue;

        // Some rows might be completely empty or headers repeating
        if (Object.keys(row).length < 5) continue;

        const supabaseProjectId = projectIdMap.get(csvProjectId);
        if (!supabaseProjectId) {
            console.warn(`Warning: Unit references unknown project ID ${csvProjectId}`);
            continue;
        }

        const unitData = {
            project_id: supabaseProjectId,
            developer: row['المطور'] || '',
            project_number: cleanNumber(row['رقم المشروع']),
            unit_number: row['رقم الوحدة فالمشروع'] || '',
            unit_type_code: row['كود نوع الوحدة'] || '',
            unit_code: row['كود الوحدة'] || '',
            project_name: row['اسم المشروع'] || '',
            unit_model: row['نموذج الوحدة'] || '',
            unit_type: row['نوع الوحدة'] || '',
            unit_area: cleanNumber(row['مساحة الوحدة']),
            private_area: cleanNumber(row['مساحة الخاصة']),
            total_area: cleanNumber(row['إجمالي المساحة']),
            price: cleanNumber(row['إجمالي السعر']),
            status: row['حالة الوحدة'] || 'متاح',
            bedrooms: cleanNumber(row['غرف النوم']),
            bathrooms: cleanNumber(row['عدد الحمامات']),
            components: row['مكونات الوحدة'] ? row['مكونات الوحدة'].split(',').map((s: string) => s.trim()) : [],
            courtyard_area: cleanNumber(row['مساحة الفناء']),
            elevator_status: row['حالة المصعد'] || '',
            floor: row['الطابق'] || '',
            building_number: row['رقم العمارة'] || '',
            deed_area: cleanNumber(row['مساحة الصك']),
            sorting_number: row['رقم الوحدة في الفرز'] || '',
            opening_date: parseDate(row['موعد إفتتاح المشروع']),
            amenities: row['مزايا'] ? row['مزايا'].split(',').map((s: string) => s.trim()) : [],
            location_url: row['الموقع'] || '',
            country: row['الدولة'] || '',
            city: row['المدينة'] || '',
            district: row['الحي'] || '',
            facade_direction: row['الواجهة'] || '',
            project_brochure_url: row['بروشور المشروع'] || '',
            unit_brochure_url: row['بروشور الوحدة'] || ''
        };

        unitBatch.push(unitData);
    }

    // Insert units in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < unitBatch.length; i += BATCH_SIZE) {
        const batchChunk = unitBatch.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('units').insert(batchChunk);
        if (error) {
            console.error(`Error inserting units batch ${i} to ${i + BATCH_SIZE}:`, error);
        } else {
            console.log(`Inserted units ${i} to ${i + batchChunk.length}`);
        }
    }

    console.log('Successfully completed database seeding from CSVs!');
}

seed().catch(console.error);
