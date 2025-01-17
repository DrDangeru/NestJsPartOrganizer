import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    Part,
    Location,
    PartStatus,
} from '../types/inventory.types';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InventoryService {
    constructor(private readonly db: DatabaseService) {}

    // Part Management
    async createPart(type: string, data: Partial<Part>): Promise<Part> {
        if (!data.partName) {
            throw new BadRequestException('partName is required');
        }

        // If locationId is provided, verify it exists
        if (data.locationId) {
            const locationExists = this.db.prepare('SELECT locationId FROM locations WHERE locationId = ?').get(data.locationId);
            if (!locationExists) {
                throw new BadRequestException(`Location with ID ${data.locationId} does not exist`);
            }
        }

        const newPart: Part = {
            ...data,
            type,
            partName: data.partName,
            status: data.status || 'available' as PartStatus,
            quantity: data.quantity ?? 1,  // ensure quantity is always set
            dateAdded: new Date().toISOString(),  // Add current date
        };

        return this.db.createPart(newPart) as any;
    }

    async createLocation(data: Omit<Location, 'locationId'>): Promise<Location> {
        if (!data.locationName) {
            throw new BadRequestException('Location name required');
        }

        return this.db.createLocation({
            locationName: data.locationName,
            container: data.container,
            row: data.row,
            position: data.position
        }) as unknown as Location;
    }

    async getPart(id: string): Promise<Part> {
        const part = await this.db.getPart(id);
        if (!part) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }
        return part as Part;
    }

    async returnPart(id: string): Promise<Part> {
        const part = await this.getPart(id);
        return this.db.updatePart(id, { ...part, status: 'available' }) as Part;
    }

    async getAllParts(): Promise<Part[]> {
        return this.db.getAllParts() as Part[];
    }

    async updatePart(id: string, data: Partial<Part>): Promise<Part> {
        const part = await this.getPart(id);
        return this.db.updatePart(id, { ...part, ...data }) as Part;
    }

    async deletePart(id: string): Promise<void> {
        await this.getPart(id); // Check if exists
        await this.db.deletePart(id);
    }

    async findPartsByLocation(locationId: string): Promise<Part[]> {
        return this.db.findPartsByLocation(locationId) as Part[];
    }

    async findPartsByLocationName(locationName: string): Promise<Part[]> {
        return this.db.findPartsByLocation(locationName) as Part[];
    }

    async findPartsByType(type: string): Promise<Part[]> {
        return this.db.findPartsByType(type) as Part[];
    }

    async findLoanedParts(): Promise<Part[]> {
        return this.db.findPartsByStatus('loaned') as Part[];
    }

    async findAvailableParts(): Promise<Part[]> {
        return this.db.findPartsByStatus('available') as Part[];
    }

    async getAllLocations(): Promise<Location[]> {
        return this.db.showLocations() as Location[];
    }

    // async getLocation(id: string): Promise<Location> {
    //     const location = await this.db.getLocation(id);
    //     if (!location) {
    //         throw new NotFoundException(`Location with ID ${id} not found`);
    //     }
    //     return location;
    // }
}