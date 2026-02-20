import { create } from 'zustand';

export interface UnitFilterState {
    searchQuery: string; // For general search if needed, or specific Project Name search
    projectId: string | null;
    status: string | null; // 'Available' | 'Sold' | 'Reserved' | 'Under Construction'
    unitTypes: string[]; // Multi-select
    priceRange: [number, number];
    bedroomsRange: [number, number]; // Range for units: min 1 max 5, etc.
    areaRange: [number, number];
    amenities: string[]; // Multi-select "Unit Components"
    direction: string | null; // Requested? Maybe not explicitly but nice to have if available.
}

interface UnitFilterActions {
    setFilter: <K extends keyof UnitFilterState>(key: K, value: UnitFilterState[K]) => void;
    resetFilters: () => void;
}

const INITIAL_STATE: UnitFilterState = {
    searchQuery: '',
    projectId: null,
    status: 'All', // Default to All
    unitTypes: [],
    priceRange: [0, 5000000], // Default range, adjustable
    bedroomsRange: [0, 10],
    areaRange: [0, 1000],
    amenities: [],
    direction: null,
};

export const useUnitFilters = create<UnitFilterState & UnitFilterActions>((set) => ({
    ...INITIAL_STATE,
    setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
    resetFilters: () => set(INITIAL_STATE),
}));
