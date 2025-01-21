import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { Part, PartStatus, Location } from '../types/inventory.types';
import { CreatePartDto } from '../dto/create-part.dto';
import { CreateLocationDto } from '../dto/create-location.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Post('parts')
    async createPart(@Body() part: Part): Promise<Part> {
        return this.inventoryService.createPart(part.type, part);
    }

    @Post('locations')
    async createLocation(@Body() location: CreateLocationDto): Promise<Location> {
        return this.inventoryService.createLocation(location);
    }

    @Get('parts')
    async getAllParts(): Promise<Part[]> {
        return this.inventoryService.getAllParts();
    }

    @Get('all-parts')
    async getAllPartsList(): Promise<Part[]> {
        return this.inventoryService.getAllParts();
    }

    @Get('parts/:name')
    async getPart(@Param('name') name: string): Promise<Part> {
        return this.inventoryService.getPart(name);
    }

    @Get('parts/:partId')
    async getPartById(@Param('partId') partId: number): Promise<Part> {
        return this.inventoryService.getPartById(partId);
    }

    @Put('parts/:name')
    async updatePart(
        @Param('name') name: string,
        @Body() data: Partial<CreatePartDto>
    ): Promise<Part> {
        return this.inventoryService.updatePart(name, data);
    }

    @Delete('parts/:id') // params were name but func uses ID .. so changed
    async deletePart(@Param('id') partId: number): Promise<any> {
        return this.inventoryService.deletePart(partId);
    }

    @Get('locations')
    async getLocations(@Query('name') name?: string): Promise<Location | Location[]> {
        if (name) {
            return this.inventoryService.getLocationByName(name);
        }
        return this.inventoryService.getAllLocations();
    }

    @Delete('locations/:name')
    async deleteLocation(@Param('name') name: string) {
        return this.inventoryService.deleteLocation(name);
    }

    @Get('search')
    async searchParts(
        @Query('location') location?: string,
        @Query('type') type?: string,
        @Query('status') status?: PartStatus
    ): Promise<Part[]> {
        if (location) {
            return this.inventoryService.findPartsByLocation(location);
        }
        if (type) {
            return this.inventoryService.findPartsByType(type);
        }
        if (status) {
            if (status === 'loaned') {
                return this.inventoryService.findLoanedParts();
            } else if (status === 'available') {
                return this.inventoryService.findAvailableParts();
            }
            throw new BadRequestException(`Invalid status: ${status}`);
        }
        return this.inventoryService.getAllParts();
    }
}