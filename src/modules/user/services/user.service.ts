import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from 'src/common/database/services/database.service';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { UserUpdateDto } from '../dtos/request/user.update.request';
import {
    UserGetProfileResponseDto,
    UserUpdateProfileResponseDto,
} from '../dtos/response/user.response';

@Injectable()
export class UserService {
    constructor(private readonly db: DatabaseService) {}

    async getProfile(userId: string): Promise<UserGetProfileResponseDto> {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(
        userId: string,
        data: UserUpdateDto
    ): Promise<UserUpdateProfileResponseDto> {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.db.user.update({ where: { id: userId }, data });
    }

    async deleteUser(userId: string): Promise<ApiGenericResponseDto> {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Cascade delete in a transaction to avoid FK constraint errors
        await this.db.$transaction([
            this.db.notificationPreference.deleteMany({ where: { userId } }),
            this.db.notification.deleteMany({ where: { userId } }),
            this.db.auditLog.deleteMany({ where: { userId } }),
            this.db.feedbackReply.deleteMany({ where: { authorId: userId } }),
            this.db.feedback.deleteMany({ where: { userId } }),
            this.db.savedShop.deleteMany({ where: { userId } }),
            this.db.comment.deleteMany({ where: { userId } }),
            this.db.electionVote.deleteMany({ where: { userId } }),
            this.db.vote.deleteMany({ where: { userId } }),
            this.db.review.deleteMany({ where: { userId } }),
            this.db.orderItem.deleteMany({
                where: { order: { residentId: userId } },
            }),
            this.db.order.deleteMany({ where: { residentId: userId } }),
            this.db.invitation.deleteMany({ where: { invitedById: userId } }),
            this.db.user.delete({ where: { id: userId } }),
        ]);

        return { success: true, message: 'User deleted' };
    }

    async deleteAccount(userId: string): Promise<void> {
        await this.deleteUser(userId);
    }
}
