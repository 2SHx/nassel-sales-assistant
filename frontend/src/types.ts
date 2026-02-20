export interface Project {
    project_id: number;
    project_name: string;
    direction: 'شمال' | 'جنوب' | 'شرق' | 'غرب';
    district: string;
    min_available_price: number;
    max_available_price?: number;
    min_available_area: number;
    max_available_area?: number;
    max_available_bedrooms: number;
    min_available_bedrooms: number;
    project_status: string;
    match_score: number;
    sales_script: string;
    marketing_pitch: string;
    unit_types: string;
    facilities: string;
    location_url: string;
    brochure_url: string;
    available_units: number;
    project_type: string;

    // Extended fields
    project_code?: string;
    owner?: string;
    project_number?: number;
    opening_date?: string;
    videos_url?: string;
    images_url?: string;
    total_units?: number;
    sold_units?: number;
    reserved_units?: number;
    sales_percentage?: number;
    min_price?: number;
    max_price?: number;
    avg_unit_value?: number;
    min_area?: number;
    max_area?: number;
}

export interface Unit {
    project_id: number;
    project_code: string;
    developer: string;
    project_number: number;
    unit_number_in_project: number;
    unit_type_code: string;
    unit_code: string;
    project_name: string;
    unit_model: string;
    unit_type: string;
    unit_area: number;
    private_area: number;
    total_area: number;
    total_price: number;
    unit_status: string;
    bedrooms: number;
    bathrooms: number;
    unit_components: string;
    yard_area: number | null;
    elevator_status: string;
    floor: number;
    building_number: string;
    deed_area: number;
    unit_number_in_sorting: string;
    project_opening_date: string;
    features: string;
    location: string;
    country: string;
    city: string;
    neighborhood: string;
    facade: string;
    project_brochure_url: string;
    unit_brochure_url: string;
}

export interface SearchFilters {
    unitType: string;
    direction: string;
    region: string;
    district: string;
    maxPrice: number;
    minArea: number;
}
