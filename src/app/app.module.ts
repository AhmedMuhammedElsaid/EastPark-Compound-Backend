import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { ShopsModule } from 'src/modules/shops/shops.module';
import { UploadsModule } from 'src/modules/uploads/uploads.module';
import { UserModule } from 'src/modules/user/user.module';

import { HealthController } from './controllers/health.controller';

@Module({
    imports: [
        // Shared infrastructure (config, db, auth, cache, email, file, logger)
        CommonModule,

        // Health check endpoint
        TerminusModule,

        // Feature modules
        UserModule,
        ShopsModule,
        ProductsModule,
        OrdersModule,
        UploadsModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
