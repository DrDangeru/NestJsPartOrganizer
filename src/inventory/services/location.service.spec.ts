import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { Location } from '../types/inventory.types';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService - Location Management', () => {
  let service: InventoryService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    // Create a type-safe mock of DatabaseService
    const mockDb = {
      createLocation: jest.fn(),
      findPartsByLocation: jest.fn(),
      prepare: jest.fn(),
      onModuleInit: jest.fn()
    } as unknown as DatabaseService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    dbService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLocation', () => {
    it('should create a new location', async () => {
      const locationData: Omit<Location, 'locationId'> = {
        locationName: 'Test Location',
        container: 'Shelf A',
        row: 1,
        position: 'Left'
      };

      const expectedLocation: Location = {
        ...locationData,
        locationId: 1
      };

      (dbService.createLocation as jest.Mock).mockResolvedValue(expectedLocation);

      const result = await service.createLocation(locationData);

      expect(result).toBeDefined();
      expect(result.locationName).toBe(locationData.locationName);
      expect(result.container).toBe(locationData.container);
      expect(dbService.createLocation).toHaveBeenCalledWith(locationData);
    });

    it('should throw BadRequestException if locationName is missing', async () => {
      const invalidData = {
        container: 'Shelf A',
        row: 1,
        position: 'Left'
      };

      await expect(service.createLocation(invalidData as any))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getLocationByName', () => {
    it('should return a location by name', async () => {
      const mockLocation: Location = {
        locationId: 1,
        locationName: 'Test Location',
        container: 'Shelf A',
        row: 1,
        position: 'Left'
      };

      (dbService.prepare as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(mockLocation)
      });

      const result = await service.getLocationByName('Test Location');

      expect(result).toBeDefined();
      expect(result.locationName).toBe(mockLocation.locationName);
      expect(result.locationId).toBe(mockLocation.locationId);
    });

    it('should throw NotFoundException for non-existent location', async () => {
      (dbService.prepare as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(undefined)
      });

      await expect(service.getLocationByName('NonExistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location if it exists and has no parts', async () => {
      const mockLocation: Location = {
        locationId: 1,
        locationName: 'Test Location',
        container: 'Shelf A',
        row: 1,
        position: 'Left'
      };

      // Mock getLocationByName
      (dbService.prepare as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(mockLocation),
        run: jest.fn().mockReturnValue({ changes: 1 })
      });

      // Mock findPartsByLocation
      (dbService.findPartsByLocation as jest.Mock).mockResolvedValue([]);

      const result = await service.deleteLocation('Test Location');

      expect(result).toEqual(expect.objectContaining({
        message: expect.stringContaining('deleted successfully')
      }));
    });

    it('should throw BadRequestException if location contains parts', async () => {
      const mockLocation: Location = {
        locationId: 1,
        locationName: 'Test Location'
      };

      // Mock getLocationByName
      (dbService.prepare as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(mockLocation)
      });

      // Mock findPartsByLocation to return some parts
      (dbService.findPartsByLocation as jest.Mock).mockResolvedValue([{ id: 1, name: 'Part 1' }]);

      await expect(service.deleteLocation('Test Location'))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});
