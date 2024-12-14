import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [InventoryService, DatabaseService],
  controllers: [InventoryController],
})
export class InventoryModule {}
