// Basic Types

export enum PartStatus {
    AVAILABLE = 'available',
    LOANED = 'loaned',
    MAINTENANCE = 'maintenance',
    DISPOSED = 'disposed'
}

// Part Types
export interface Part {
    partId?: number;
    partName: string;
    partDescription?: string;
    type: string;
    status: PartStatus;
    dateAdded?: string;
    currentLoan?: string;
    quantity: number;
    manufacturer?: string;
    model?: string;
    // Location details
    locationName?: string;
    container?: string;
    row?: number;
    position?: string;
    category?: PartCategory;
}

// Location Types
export interface Location {
    locationName: string;
    locationId?: number;
    container?: string;
    row?: number;
    position?: string;
}

// Category types for validation , needs to be used as enum
export const PartCategories = [
    'hand', 'power', 'measurement', 'specialty',
    'sensor', 'buck converter', 'transistor', 'diode',
    'capacitor', 'resistor', 'pcb', 'inductor', 'led',
    'led module'
] as const;

export type PartCategory = typeof PartCategories[number];