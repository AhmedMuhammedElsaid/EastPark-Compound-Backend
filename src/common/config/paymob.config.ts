import { registerAs } from '@nestjs/config';

export default registerAs(
    'paymob',
    (): Record<string, unknown> => ({
        apiKey: process.env.PAYMOB_API_KEY ?? '',
        hmacSecret: process.env.PAYMOB_HMAC_SECRET ?? '',
    })
);
