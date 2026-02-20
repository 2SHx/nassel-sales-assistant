import { Project } from '../types';
import { supabase } from '../lib/supabase';

export interface MapProject extends Project {
    lat: number;
    lng: number;
    [key: string]: any;
}

export const fetchProjects = async (): Promise<MapProject[]> => {
    try {
        const { data, error } = await supabase.from('projects').select('*');

        if (error) {
            console.warn('Supabase fetch error (projects):', error);
            return [];
        }

        if (data && data.length > 0) {
            return data.map(p => ({
                ...p,
                min_available_price: Number(p.min_available_price),
                max_available_price: Number(p.max_available_price),
                min_available_area: Number(p.min_available_area),
                max_available_area: Number(p.max_available_area),
                lat: Number(p.lat),
                lng: Number(p.lng),
            })) as MapProject[];
        }
    } catch (error) {
        console.warn('Failed to fetch projects from Supabase:', error);
    }

    return [];
};
