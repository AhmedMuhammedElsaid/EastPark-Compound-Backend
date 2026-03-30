import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { DatabaseService } from 'src/common/database/services/database.service';
import { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { ShopCreateDto } from './dtos/request/shop.create.dto';
import { ShopQueryDto } from './dtos/request/shop.query.dto';
import { ShopUpdateDto } from './dtos/request/shop.update.dto';
import {
    ShopListResponseDto,
    ShopResponseDto,
} from './dtos/response/shop.response.dto';

@Injectable()
export class ShopsService {
    constructor(private readonly db: DatabaseService) {}

    async create(dto: ShopCreateDto): Promise<ShopResponseDto> {
        const shop = await this.db.shop.create({
            data: {
                name: dto.name,
                nameAr: dto.nameAr,
                description: dto.description,
                descriptionAr: dto.descriptionAr,
                category: dto.category,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                deliveryTime: dto.deliveryTime,
                merchantId: dto.merchantId,
            },
            include: { photos: { orderBy: { order: 'asc' } } },
        });
        return shop;
    }

    async findAll(query: ShopQueryDto): Promise<ShopListResponseDto> {
        const limit = query.limit ?? 20;

        const items = await this.db.shop.findMany({
            where: {
                ...(query.category ? { category: query.category } : {}),
                ...(query.search
                    ? {
                          OR: [
                              {
                                  name: {
                                      contains: query.search,
                                      mode: 'insensitive',
                                  },
                              },
                              {
                                  nameAr: {
                                      contains: query.search,
                                      mode: 'insensitive',
                                  },
                              },
                          ],
                      }
                    : {}),
            },
            take: limit + 1,
            ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
            orderBy: { createdAt: 'desc' },
            include: { photos: { orderBy: { order: 'asc' } } },
        });

        let nextCursor: string | undefined;
        if (items.length > limit) {
            const last = items.pop();
            nextCursor = last?.id;
        }

        return { items, nextCursor };
    }

    async findOne(id: string): Promise<ShopResponseDto> {
        const shop = await this.db.shop.findUnique({
            where: { id },
            include: { photos: { orderBy: { order: 'asc' } } },
        });
        if (!shop) throw new NotFoundException('shop.error.notFound');
        return shop;
    }

    async update(
        id: string,
        dto: ShopUpdateDto,
        actor: IAuthUser
    ): Promise<ShopResponseDto> {
        const shop = await this.db.shop.findUnique({ where: { id } });
        if (!shop) throw new NotFoundException('shop.error.notFound');

        // Merchants can only update their own shop
        if (actor.role === Role.MERCHANT && shop.merchantId !== actor.userId) {
            throw new ForbiddenException('shop.error.forbidden');
        }

        const updated = await this.db.shop.update({
            where: { id },
            data: {
                name: dto.name,
                nameAr: dto.nameAr,
                description: dto.description,
                descriptionAr: dto.descriptionAr,
                category: dto.category,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                deliveryTime: dto.deliveryTime,
                isOpen: dto.isOpen,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                workingHours: dto.workingHours as any,
            },
            include: { photos: { orderBy: { order: 'asc' } } },
        });
        return updated as ShopResponseDto;
    }

    async remove(id: string): Promise<void> {
        const shop = await this.db.shop.findUnique({ where: { id } });
        if (!shop) throw new NotFoundException('shop.error.notFound');
        await this.db.shop.delete({ where: { id } });
    }

    async addPhoto(
        shopId: string,
        url: string,
        order: number
    ): Promise<ShopResponseDto> {
        const shop = await this.db.shop.findUnique({ where: { id: shopId } });
        if (!shop) throw new NotFoundException('shop.error.notFound');

        await this.db.shopPhoto.create({ data: { shopId, url, order } });

        return this.findOne(shopId);
    }

    async removePhoto(shopId: string, photoId: string): Promise<void> {
        const photo = await this.db.shopPhoto.findUnique({
            where: { id: photoId },
        });
        if (!photo || photo.shopId !== shopId) {
            throw new NotFoundException('shop.error.photoNotFound');
        }
        await this.db.shopPhoto.delete({ where: { id: photoId } });
    }
}
