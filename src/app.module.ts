import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
// import { AppService } from './app.service'; deleted
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
  controllers: [AppController],
  providers: [ DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}