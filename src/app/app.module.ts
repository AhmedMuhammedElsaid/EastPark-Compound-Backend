import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
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
    ],
    controllers: [HealthController],
})
export class AppModule {}
