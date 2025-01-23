import { Injectable, NotFoundException, BadRequestException, 
    InternalServerErrorException } from '@nestjs/common';
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

        const newPart: Part = {
            ...data,
            type,
            partName: data.partName,
            status: data.status || 'available' as PartStatus,
            quantity: data.quantity ?? 1,  // ensure quantity is always set
            dateAdded: new Date().toISOString(),  // Add current date
        };

        return this.db.createPart(newPart) as Part;
    }

    async getPart( partName: string): Promise<Part> {
        const part = await this.db.getPart(partName);
        if (!part) {
            throw new NotFoundException(`Part with ID ${partName} not found`);
        }
        return part as Part;
    }

    async getPartById(partId: number): Promise<Part> {
        const part = await this.db.getPartById(partId);
        if (!part) {
            throw new NotFoundException(`Part with ID ${partId} not found`);
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

    async deletePart(partId: number): Promise<void> { // used name but did not work...
        await this.getPartById(partId); // Check if exists
        await this.db.deletePartById(partId); // Delete it(partId), prev used name
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

    // Location Management
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
    async getLocationByName(name: string): Promise<Location> {
        const location = this.db.prepare(
            'SELECT * FROM locations WHERE locationName = ?'
        ).get(name) as Location | undefined;

        if (!location) {
            throw new NotFoundException(`Location with name ${name} not found`);
        }

        return location;
    }

    async deleteLocation(name: string) {
        // First check if location exists
        const location = await this.getLocationByName(name);
        if (!location) {
            throw new NotFoundException(`Location with name ${name} not found`);
        }

        // Check if there are any parts in this location
        const parts = await this.db.findPartsByLocation(name);
        if (parts && parts.length > 0) {
            throw new BadRequestException(
                `Cannot delete location "${name}" because it contains
                 ${parts.length} parts. Please move or delete these parts first.`
            );
        }

        try {
            const result = this.db.prepare('DELETE FROM locations WHERE locationName = ?').run(name);
            if (result.changes === 0) {
                throw new NotFoundException(`Location with name ${name} not found`);
            }
            return { message: `Location ${name} deleted successfully` };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to delete location: ${error.message}`);
        }
    }
}