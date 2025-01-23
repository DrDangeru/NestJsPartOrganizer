import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { Part, PartStatus } from '../types/inventory.types';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('InventoryService - Part Management', () => {
  let service: InventoryService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    // Create a type-safe mock of DatabaseService with only part-related methods
    const mockDb = {
      createPart: jest.fn(),
      getPartById: jest.fn(),
      getPart: jest.fn(),
      getAllParts: jest.fn(),
      updatePart: jest.fn(),
      findPartsByLocation: jest.fn(),
      findPartsByType: jest.fn(),
      findPartsByStatus: jest.fn(),
      deletePart: jest.fn(),
      deletePartById: jest.fn(),
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

  describe('createPart', () => {
    it('should create a new part', async () => {
      const partData: Partial<Part> = {
        partName: 'Test Part',
        partDescription: 'Test Description',
        quantity: 10,
        status: PartStatus.AVAILABLE,
        manufacturer: 'Test Manufacturer',
        dateAdded: '01-01-2023'
      };

      const expectedPart: Part = {
        partId: 1,
        partName: 'Test Part',
        partDescription: 'Test Description',
        quantity: 10,
        type: 'electronic',
        status: PartStatus.AVAILABLE,
        manufacturer: 'Test Manufacturer',
        dateAdded: '01-01-2023'
      };

      // Type-safe mock implementation
      (dbService.createPart as jest.Mock).mockResolvedValue(expectedPart);
      
      const result = await service.createPart('electronic', partData);

      expect(result).toBeDefined();
      expect(result.partName).toBe(partData.partName);
      expect(result.quantity).toBe(partData.quantity);
      expect(result.type).toBe('electronic');
      expect(result.status).toBe(PartStatus.AVAILABLE);
      expect(dbService.createPart).toHaveBeenCalledWith(expect.objectContaining({
        partName: partData.partName,
        type: 'electronic',
        status: PartStatus.AVAILABLE
      }));
    });
  });

  describe('getPartById', () => {
    it('should return a part by id', async () => {
      const mockPart: Part = {
        partId: 1,
        partName: 'Test Part',
        partDescription: 'Test Description',
        quantity: 10,
        type: 'electronic',
        status: PartStatus.AVAILABLE,
        manufacturer: 'Test Manufacturer',
        dateAdded: '01-01-2023'
      };

      // Type-safe mock implementation
      (dbService.getPartById as jest.Mock).mockResolvedValue(mockPart);
      
      const result = await service.getPartById(1);
      
      expect(result).toBeDefined();
      expect(result.partId).toBe(1);
      expect(result.partName).toBe(mockPart.partName);
      expect(dbService.getPartById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent part', async () => {
      // Type-safe mock implementation
      (dbService.getPartById as jest.Mock).mockResolvedValue(undefined);
      
      await expect(service.getPartById(999999))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // TODO: Add tests for other part management methods:
  // - updatePart
  // - deletePart
  // - findPartsByType
  // - findPartsByLocation
  // - findPartsByStatus
  // - getAllParts
});
