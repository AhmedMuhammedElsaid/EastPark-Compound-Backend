import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';

@Module({
    imports: [DatabaseModule],
    controllers: [OrdersController],
    providers: [OrdersGateway, OrdersService],
    exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
