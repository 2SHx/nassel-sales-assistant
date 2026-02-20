'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types';
import { useProjectFilters } from '@/store/useProjectFilters';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const filters = useProjectFilters();


    // Derived options from all projects (unfiltered)
    const [options, setOptions] = useState({
        districts: [] as string[],
        developers: [] as string[],
        unitTypes: [] as string[],
        amenities: [] as string[],
        directions: [] as string[],
        projectNames: [] as { id: string, name: string }[]
    });

    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoading(true);
                // Fetch projects with their units to calculate area range if missing
                const { data, error } = await supabase
                    .from('projects')
                    .select('*, units(unit_area, bedrooms)');

                if (error) {
                    console.error('Supabase error:', error);
                    setLoading(false);
                    return;
                }

                if (data) {
                    // Transform Supabase data to Project interface
                    const mapped: Project[] = data.map((p: any) => {
                        // Calculate min/max area and bedrooms from units
                        let minArea = Number(p.min_available_area || p.min_area) || 0;
                        let maxArea = Number(p.max_available_area || p.max_area) || 0;
                        let minBedrooms = 0;
                        let maxBedrooms = 0;

                        if (p.units && p.units.length > 0) {
                            // Area
                            if (minArea === 0 || maxArea === 0) {
                                const areas = p.units.map((u: any) => Number(u.unit_area) || 0).filter((a: number) => a > 0);
                                if (areas.length > 0) {
                                    minArea = Math.min(...areas);
                                    maxArea = Math.max(...areas);
                                }
                            }
                            // Bedrooms
                            const bedrooms = p.units.map((u: any) => Number(u.bedrooms) || 0).filter((b: number) => b > 0);
                            if (bedrooms.length > 0) {
                                minBedrooms = Math.min(...bedrooms);
                                maxBedrooms = Math.max(...bedrooms);
                            }
                        }

                        // Default direction if missing (for demo)
                        const direction = p.direction || 'شمال';

                        return {
                            id: p.project_id,
                            name: p.project_name,
                            status: (function (status: string) {
                                if (status === 'متاح' || status === 'Available') return 'Available';
                                if (status === 'مباع' || status === 'Sold Out' || status === 'مكتمل' || status === 'Sold') return 'Sold Out';
                                if (status === 'تحت الإنشاء' || status === 'Under Construction') return 'Under Construction';
                                if (status === 'جاهز' || status === 'Ready') return 'Ready';
                                return 'Available'; // Default
                            })(p.project_status),
                            location: {
                                lat: Number(p.lat),
                                lng: Number(p.lng),
                                city: p.city,
                                district: p.district
                            },
                            priceStart: Number(p.min_available_price || p.min_price),
                            areaRange: {
                                min: minArea,
                                max: maxArea
                            },
                            bedroomsRange: {
                                min: minBedrooms,
                                max: maxBedrooms
                            },
                            amenities: p.facilities ? p.facilities.split(',') : [],
                            unitTypes: p.unit_types ? p.unit_types.split('-') : [],
                            images: ['https://images.unsplash.com/photo-1600596542815-e32c21422ee8?auto=format&fit=crop&w=800&q=80'], // Placeholder for now
                            developer: p.developer,
                            description: p.marketing_pitch,
                            direction: direction
                        };
                    });

                    setProjects(mapped);

                    // Extract Options
                    const districts = Array.from(new Set(mapped.map(p => p.location.district).filter(Boolean)));
                    const developers = Array.from(new Set(mapped.map(p => p.developer).filter(Boolean) as string[]));
                    const unitTypes = Array.from(new Set(mapped.flatMap(p => p.unitTypes).filter(Boolean)));
                    const amenities = Array.from(new Set(mapped.flatMap(p => p.amenities).filter(Boolean)));
                    const projectNames = mapped.map(p => ({ id: p.id, name: p.name }));

                    setOptions({
                        districts: districts.sort(),
                        developers: developers.sort(),
                        unitTypes: unitTypes.sort(),
                        amenities: amenities.sort(),
                        directions: ['شمال', 'شرق', 'غرب', 'جنوب'],
                        projectNames: projectNames.sort((a, b) => a.name.localeCompare(b.name))
                    });
                }
            } catch (err) {
                console.error('Unexpected error in fetchProjects:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        // Search
        if (filters.searchQuery && !p.name.includes(filters.searchQuery)) return false;

        // Status
        if (filters.status !== 'All' && p.status !== filters.status) return false;

        // Price
        if (p.priceStart < filters.priceRange[0] || p.priceStart > filters.priceRange[1]) return false;

        // Area Range
        if (p.areaRange.max > 0) {
            const overlap = (p.areaRange.min <= filters.areaRange[1]) && (p.areaRange.max >= filters.areaRange[0]);
            if (!overlap) return false;
        }

        // Bedroom Range
        if (p.bedroomsRange && p.bedroomsRange.max > 0) {
            const overlap = (p.bedroomsRange.min <= filters.bedroomsRange[1]) && (p.bedroomsRange.max >= filters.bedroomsRange[0]);
            if (!overlap) return false;
        }

        // District
        if (filters.district && p.location.district !== filters.district) return false;

        // Direction
        if (filters.direction && p.direction !== filters.direction) return false;

        // Developer
        if (filters.developer && p.developer !== filters.developer) return false;

        // Unit Types (Multi-select: Match ANY)
        if (filters.unitTypes.length > 0) {
            const hasAnyType = filters.unitTypes.some(t => p.unitTypes.includes(t));
            if (!hasAnyType) return false;
        }

        // Amenities (Multi-select: Match ALL)
        if (filters.amenities.length > 0) {
            const hasAllAmenities = filters.amenities.every(a => p.amenities.includes(a));
            if (!hasAllAmenities) return false;
        }

        return true;
    });

    return { projects: filteredProjects, loading, options };
}
