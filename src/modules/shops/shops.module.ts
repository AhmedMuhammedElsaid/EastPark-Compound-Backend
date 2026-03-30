import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ShopsController],
    providers: [ShopsService],
    exports: [ShopsService],
})
export class ShopsModule {}
