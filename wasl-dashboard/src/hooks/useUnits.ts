'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Unit } from '@/lib/types';

import { useUnitFilters } from '@/store/useUnitFilters';

// Normalize direction values from DB (feminine→short form)
function normalizeDirection(dir: string | null | undefined): string | undefined {
    if (!dir) return undefined;
    const map: Record<string, string> = {
        'شمالية': 'شمال', 'شمال': 'شمال',
        'جنوبية': 'جنوب', 'جنوب': 'جنوب',
        'شرقية': 'شرق', 'شرق': 'شرق',
        'غربية': 'غرب', 'غرب': 'غرب',
        'شمالية شرقية': 'شمال شرق', 'شمال شرق': 'شمال شرق',
        'شمالية غربية': 'شمال غرب', 'شمال غرب': 'شمال غرب',
        'جنوبية شرقية': 'جنوب شرق', 'جنوب شرق': 'جنوب شرق',
        'جنوبية غربية': 'جنوب غرب', 'جنوب غرب': 'جنوب غرب',
    };
    return map[dir.trim()] || dir;
}

export function useUnits() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const filters = useUnitFilters();

    // Derived options from all units
    const [options, setOptions] = useState({
        projectNames: [] as { id: string, name: string }[],
        unitTypes: [] as string[],
        amenities: [] as string[],
        directions: [] as string[],
    });

    useEffect(() => {
        async function fetchUnits() {
            setLoading(true);
            const { data, error } = await supabase
                .from('units')
                .select('*, projects(project_name, facilities, developer, direction, lat, lng, district, city, project_status)');
            // fetching facilities from project to map to unit amenities if unit doesn't have specific ones

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            if (data) {
                const mapped: Unit[] = data.map((u: any) => {
                    const statusVal = u.unit_status || '';
                    let status: 'Available' | 'Reserved' | 'Sold' = 'Available'; // Default

                    if (statusVal === 'متاح' || statusVal === 'متاحة' || statusVal === 'Available' || statusVal === 'تحت الإنشاء') status = 'Available';
                    else if (statusVal === 'مباع' || statusVal === 'مباعة' || statusVal === 'Sold' || statusVal === 'غير متاحة') status = 'Sold';
                    else if (statusVal === 'محجوز' || statusVal === 'محجوزة' || statusVal === 'Reserved') status = 'Reserved';

                    // Amenities: Map from project facilities if unit specific features are missing
                    const projectAmenities = u.projects?.facilities ? u.projects.facilities.split(',') : [];

                    return {
                        id: u.id,
                        projectId: u.project_id,
                        projectName: u.projects?.project_name,
                        type: u.unit_type,
                        price: Number(u.total_price) || 0,
                        bedrooms: Number(u.bedrooms) || 0,
                        bathrooms: Number(u.bathrooms) || 0,
                        area: Number(u.unit_area) || 0,
                        status: status,
                        floor: u.floor ? Number(u.floor) : undefined,
                        orientation: normalizeDirection(u.direction),
                        direction: normalizeDirection(u.direction || u.projects?.direction),
                        amenities: projectAmenities, // Using project amenities for now
                        developer: u.projects?.developer,
                        projectStatus: u.projects?.project_status,
                        projectLocation: u.projects?.lat ? {
                            lat: Number(u.projects.lat),
                            lng: Number(u.projects.lng),
                            city: u.projects?.city,
                            district: u.projects?.district
                        } : undefined
                    };
                });
                setUnits(mapped);

                // Extract Options
                const projectNames = Array.from(new Set(mapped.map(u => JSON.stringify({ id: u.projectId, name: u.projectName }))))
                    .map(s => JSON.parse(s))
                    .filter(p => p.id && p.name)
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));

                const unitTypes = Array.from(new Set(mapped.map(u => u.type).filter(Boolean))).sort();

                // Amenities from all units (which come from projects)
                const allAmenities = Array.from(new Set(mapped.flatMap(u => u.amenities || []).filter(Boolean))).sort();

                setOptions({
                    projectNames: projectNames,
                    unitTypes: unitTypes,
                    amenities: allAmenities,
                    directions: ['شمال', 'شرق', 'غرب', 'جنوب']
                });
            }
            setLoading(false);
        }

        fetchUnits();
    }, []);

    // Filter Logic
    const filteredUnits = units.filter(u => {
        // Project ID
        if (filters.projectId && u.projectId !== filters.projectId) return false;

        // Search Query (Project Name)
        if (filters.searchQuery && u.projectName && !u.projectName.includes(filters.searchQuery)) return false;


        // Status
        if (filters.status !== 'All' && filters.status && u.status !== filters.status) return false;

        // Unit Type (Multi-select)
        if (filters.unitTypes.length > 0) {
            if (!filters.unitTypes.includes(u.type)) return false;
        }

        // Price Range
        if (u.price < filters.priceRange[0] || u.price > filters.priceRange[1]) return false;

        // Area Range
        if (u.area < filters.areaRange[0] || u.area > filters.areaRange[1]) return false;

        // Bedrooms Range (Exact match or range?) 
        // User asked for "Bedroom Range (Min/Max counters)"
        if (u.bedrooms < filters.bedroomsRange[0] || u.bedrooms > filters.bedroomsRange[1]) return false;

        // Amenities (Multi-select: Match ALL or ANY? Let's go with ALL)
        if (filters.amenities.length > 0) {
            const unitAmenities = u.amenities || [];
            const hasAll = filters.amenities.every(a => unitAmenities.includes(a));
            if (!hasAll) return false;
        }

        // Direction
        if (filters.direction && u.direction !== filters.direction) return false;

        return true;
    });

    return { units: filteredUnits, loading, options };
}
