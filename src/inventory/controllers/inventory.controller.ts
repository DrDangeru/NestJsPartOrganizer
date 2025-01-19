import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
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

    @Put('parts/:name')
    async updatePart(
        @Param('name') name: string,
        @Body() data: Partial<CreatePartDto>
    ): Promise<Part> {
        return this.inventoryService.updatePart(name, data);
    }

    @Delete('parts/:name')
    async deletePart(@Param('name') name: string): Promise<any> {
        return this.inventoryService.deletePart(name);
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
        // if (status) {
        //     return this.inventoryService.findPartsByStatus(status);
        // }
        return this.inventoryService.getAllParts();
    }
}