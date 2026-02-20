import { Unit } from '../types';
import { supabase } from '../lib/supabase';

export const fetchUnitsByProject = async (projectId: number): Promise<Unit[]> => {
    try {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .eq('project_id', projectId);

        if (error) {
            console.error('Error fetching units:', error);
            return [];
        }

        return data as Unit[];
    } catch (error) {
        console.error('Unexpected error fetching units:', error);
        return [];
    }
};
