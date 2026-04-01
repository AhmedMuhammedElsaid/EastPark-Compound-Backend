import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { PaymentsInitiateController } from './payments-initiate.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
    imports: [DatabaseModule],
    controllers: [PaymentsController, PaymentsInitiateController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
