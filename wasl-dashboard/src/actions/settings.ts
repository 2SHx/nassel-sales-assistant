'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// --- Form Options (Dropdown Lists) ---

export async function getFormOptions(category: string) {
    try {
        const { data, error } = await supabase
            .from('form_options')
            .select('options')
            .eq('category', category)
            .single();

        if (error) {
            // Handle case where row doesn't exist yet
            if (error.code === 'PGRST116') {
                return { success: true, options: [] };
            }
            console.error('Error fetching form options:', error);
            return { success: false, error: error.message };
        }

        return { success: true, options: data?.options || [] };
    } catch (err: any) {
        console.error('Exception fetching form options:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

export async function getAllFormOptions() {
    try {
        const { data, error } = await supabase
            .from('form_options')
            .select('category, options');

        if (error) {
            console.error('Error fetching all form options:', error);
            return { success: false, error: error.message };
        }

        const optionsMap = data?.reduce((acc: any, row) => {
            acc[row.category] = row.options;
            return acc;
        }, {}) || {};

        return { success: true, data: optionsMap };
    } catch (err: any) {
        console.error('Exception fetching all form options:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

export async function updateFormOptions(category: string, options: string[]) {
    try {
        const { data, error } = await supabase
            .from('form_options')
            .upsert({ category, options }, { onConflict: 'category' })
            .select();

        if (error) {
            console.error('Error updating form options:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        revalidatePath('/units');
        revalidatePath('/projects');

        return { success: true, data };
    } catch (err: any) {
        console.error('Exception updating form options:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

// --- Form Schema (Custom Fields) ---

export async function getFormSchema(entityType: 'project' | 'unit') {
    try {
        const { data, error } = await supabase
            .from('form_schema')
            .select('*')
            .eq('entity_type', entityType)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching form schema:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err: any) {
        console.error('Exception fetching form schema:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

export async function createSchemaField(payload: any) {
    try {
        // Find max order index to append newly created field
        const { data: existingData, error: countError } = await supabase
            .from('form_schema')
            .select('order_index')
            .eq('entity_type', payload.entity_type)
            .order('order_index', { ascending: false })
            .limit(1);

        const nextOrder = existingData && existingData.length > 0 ? (existingData[0].order_index || 0) + 1 : 0;

        const { data, error } = await supabase
            .from('form_schema')
            .insert({ ...payload, order_index: nextOrder })
            .select()
            .single();

        if (error) {
            console.error('Error creating schema field:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        revalidatePath(`/${payload.entity_type}s`); // simplified revalidation

        return { success: true, data };
    } catch (err: any) {
        console.error('Exception creating schema field:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

export async function deleteSchemaField(id: string) {
    try {
        const { error } = await supabase
            .from('form_schema')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting schema field:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        revalidatePath('/units');
        revalidatePath('/projects');

        return { success: true };
    } catch (err: any) {
        console.error('Exception deleting schema field:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

export async function updateSchemaField(id: string, payload: any) {
    try {
        const { data, error } = await supabase
            .from('form_schema')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating schema field:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        revalidatePath('/projects');
        revalidatePath('/units');

        return { success: true, data };
    } catch (err: any) {
        console.error('Exception updating schema field:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}
