import { create } from 'zustand';

export interface FilterState {
    searchQuery: string;
    status: string; // 'All' | 'Under Construction' | 'Ready' | 'Sold Out'
    unitTypes: string[];
    priceRange: [number, number];
    bedroomsRange: [number, number];
    district: string | null;
    direction: string | null;
    areaRange: [number, number];
    amenities: string[];
    developer: string | null;
}

interface FilterActions {
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    resetFilters: () => void;
}

const INITIAL_STATE: FilterState = {
    searchQuery: '',
    status: 'All',
    unitTypes: [],
    priceRange: [0, 10000000], // Default range
    bedroomsRange: [0, 10], // Default range
    district: null,
    direction: null,
    areaRange: [0, 5000], // Default range in sqm
    amenities: [],
    developer: null,
};

export const useProjectFilters = create<FilterState & FilterActions>((set) => ({
    ...INITIAL_STATE,
    setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
    resetFilters: () => set(INITIAL_STATE),
}));
