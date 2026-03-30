import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

import { DatabaseService } from 'src/common/database/services/database.service';

export interface PaymobWebhookPayload {
    type: string;
    obj: {
        id: number;
        success: boolean;
        amount_cents: number;
        currency: string;
        order: { id: number; merchant_order_id: string };
        pending: boolean;
        source_data: { type: string };
        hmac: string;
    };
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly hmacSecret: string;

    // Paymob hashed keys used for HMAC-SHA512 signature
    private static readonly HMAC_FIELDS = [
        'amount_cents',
        'created_at',
        'currency',
        'error_occured',
        'has_parent_transaction',
        'id',
        'integration_id',
        'is_3d_secure',
        'is_auth',
        'is_capture',
        'is_refunded',
        'is_standalone_payment',
        'is_voided',
        'order',
        'owner',
        'pending',
        'source_data.pan',
        'source_data.sub_type',
        'source_data.type',
        'success',
    ];

    constructor(
        private readonly db: DatabaseService,
        private readonly config: ConfigService
    ) {
        this.hmacSecret = this.config.getOrThrow<string>('paymob.hmacSecret');
    }

    verifyHmac(body: Record<string, unknown>, hmac: string): boolean {
        const concatenated = PaymentsService.HMAC_FIELDS.map(field => {
            const parts = field.split('.');
            let value: unknown = body;
            for (const part of parts) {
                value = (value as Record<string, unknown>)?.[part];
            }
            return value ?? '';
        }).join('');

        const computed = crypto
            .createHmac('sha512', this.hmacSecret)
            .update(concatenated)
            .digest('hex');

        return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac));
    }

    async handleWebhook(payload: PaymobWebhookPayload): Promise<void> {
        if (payload.type !== 'TRANSACTION') return;

        const { obj } = payload;
        const hmac = obj.hmac;

        if (!this.verifyHmac(obj as unknown as Record<string, unknown>, hmac)) {
            this.logger.warn('Paymob HMAC verification failed');
            throw new UnauthorizedException('payments.error.invalidHmac');
        }

        if (!obj.success || obj.pending) {
            this.logger.log(
                `Paymob transaction ${obj.id} not successful — skipping`
            );
            return;
        }

        const merchantOrderId = obj.order.merchant_order_id;
        if (!merchantOrderId) {
            throw new BadRequestException('payments.error.missingOrderId');
        }

        const order = await this.db.order.findUnique({
            where: { id: merchantOrderId },
        });
        if (!order) throw new NotFoundException('payments.error.orderNotFound');

        await this.db.order.update({
            where: { id: merchantOrderId },
            data: {
                isPaid: true,
                paymobOrderId: String(obj.id),
            },
        });

        this.logger.log(
            `Order ${merchantOrderId} marked as paid (Paymob tx: ${obj.id})`
        );
    }
}
