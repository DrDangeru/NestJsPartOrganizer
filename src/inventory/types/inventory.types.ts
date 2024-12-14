// Basic Types

export enum PartStatus {
    AVAILABLE = 'available',
    LOANED = 'loaned',
    MAINTENANCE = 'maintenance',
    DISPOSED = 'disposed'
}

// Part Types
export interface Part {
    partName: string;
    partId?: string;
    type: string;
    status: PartStatus;
    dateAdded?: string;
    currentLoan?: string;
    quantity: number;
    manufacturer?: string;
    model?: string;
    // Location details
    locationName?: string;
    locationId? : string;
    container?: string;
    row?: number;
    position?: string;
    category?: 'hand' | 'power' | 'measurement' | 'specialty' | 
              'sensor' | 'buck converter' | 'transistor' | 'diode' | 
              'capacitor' | 'resistor' | 'pcb' | 'inductor' | 'led' | 
              'led module';
}

// Location Types
export interface Location {
    locationName: string;
    locationId?: string;
    container?: string;
    row?: number;
    position?: string;
}

// Category types for validation
export const PartCategories = [
    'hand', 'power', 'measurement', 'specialty',
    'sensor', 'buck converter', 'transistor', 'diode',
    'capacitor', 'resistor', 'pcb', 'inductor', 'led',
    'led module'
] as const;

export type PartCategory = typeof PartCategories[number];