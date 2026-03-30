import { registerAs } from '@nestjs/config';

import { APP_ENVIRONMENT } from 'src/app/enums/app.enum';

export default registerAs('app', (): Record<string, unknown> => {
    const corsOrigins = process.env.APP_CORS_ORIGINS
        ? process.env.APP_CORS_ORIGINS.split(',').map(o => o.trim())
        : ['*'];

    return {
        env: process.env.APP_ENV ?? APP_ENVIRONMENT.LOCAL,
        name: process.env.APP_NAME ?? 'EastPark API',
        url: process.env.APP_URL ?? 'http://localhost:3000',

        throttle: {
            ttl: 60,
            limit: 100,
        },

        http: {
            host: process.env.HTTP_HOST ?? '0.0.0.0',
            port: process.env.HTTP_PORT
                ? parseInt(process.env.HTTP_PORT, 10)
                : 3000,
        },

        cors: {
            origin: corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        },

        logLevel: process.env.APP_LOG_LEVEL ?? 'info',
    };
});
