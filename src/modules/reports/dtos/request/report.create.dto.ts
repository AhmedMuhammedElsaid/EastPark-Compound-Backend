import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ReportCreateDto {
    @ApiProperty({ example: 'Q1 2025 Financial Report' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'تقرير مالي الربع الأول 2025' })
    @IsString()
    @IsNotEmpty()
    titleAr: string;

    @ApiProperty({ description: 'PDF URL from /uploads/pdf' })
    @IsUrl()
    @IsNotEmpty()
    pdfUrl: string;
}
