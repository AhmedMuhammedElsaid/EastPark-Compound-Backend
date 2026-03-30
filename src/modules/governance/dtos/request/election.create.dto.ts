import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ElectionCreateDto {
    @ApiProperty({ example: 'Board of Directors Election 2025' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'انتخابات مجلس الإدارة 2025' })
    @IsString()
    @IsNotEmpty()
    titleAr: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Election expiry ISO 8601 date' })
    @Type(() => Date)
    @IsDate()
    expiresAt: Date;
}
