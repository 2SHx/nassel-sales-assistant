export type ProjectStatus = 'Under Construction' | 'Ready' | 'Sold Out' | 'Available';

export interface Project {
    id: string;
    name: string;
    status: ProjectStatus;
    location: {
        lat: number;
        lng: number;
        city: string;
        district: string;
    };
    priceStart: number;
    areaRange: {
        min: number;
        max: number;
    };
    amenities: string[];
    unitTypes: string[];
    images?: string[];
    developer?: string;
    description?: string;
    direction?: string; // Added Direction
    bedroomsRange?: {
        min: number;
        max: number;
    };
    videoUrl?: string | null;
    brochureUrl?: string | null;
}

export interface Unit {
    id: string;
    projectId: string;
    projectName?: string;
    type: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    status: 'Available' | 'Reserved' | 'Sold';
    floor?: number;
    direction?: string; // Standardized to direction
    orientation?: string; // Kept for backward compatibility if needed
    // Extended fields (Verified DB Columns)
    unitCode?: string; // unit_code
    model?: string; // unit_model
    developer?: string; // developer
    elevatorStatus?: boolean; // elevator_status
    specialArea?: number; // special_area
    totalArea?: number; // total_area
    projectOpeningDate?: string; // project_opening_date
    unitNumber?: string; // unit_number (mapped from unit_number_in_project or standard)
    unitNumberInProject?: string; // unit_number_in_project
    buildingNumber?: string; // building_number
    sortingNumber?: string; // unit_number_in_sorting
    patioArea?: number; // yard_area
    unitBrochure?: string; // unit_brochure
    projectBrochure?: string; // project_brochure
    unitComponents?: string; // unit_components
    features?: string; // features
    virtualTourUrl?: string; // Not in DB yet, keeping for type safety but will be undefined
    videoUrl?: string; // Not in DB yet
    images?: string[]; // Not in DB yet
    amenities?: string[]; // Added for filtering/display
    projectStatus?: string;
    projectLocation?: {
        lat: number;
        lng: number;
        city?: string;
        district?: string;
    };
}
