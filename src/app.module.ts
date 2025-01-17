import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { InventoryModule } from './inventory/inventory.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    InventoryModule,
  ],
  controllers: [],
  providers: [ DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}