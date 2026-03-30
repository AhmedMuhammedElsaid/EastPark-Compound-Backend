import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

export class UserResponseDto implements Partial<User> {
    @ApiProperty({ example: faker.string.nanoid() })
    @Expose()
    @IsString()
    id: string;

    @ApiProperty({ example: faker.person.fullName() })
    @Expose()
    @IsString()
    name: string;

    @ApiProperty({ example: faker.internet.email() })
    @Expose()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+201234567890', required: false, nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    phone: string | null;

    @ApiProperty({ example: 'A1-301', required: false, nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    unitNumber: string | null;

    @ApiProperty({
        example: faker.image.avatar(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    avatarUrl: string | null;

    @ApiProperty({ enum: $Enums.Role, example: $Enums.Role.RESIDENT })
    @Expose()
    @IsEnum($Enums.Role)
    role: $Enums.Role;

    @ApiProperty({ example: false })
    @Expose()
    @IsBoolean()
    isVerified: boolean;

    @ApiProperty({ example: faker.date.past().toISOString() })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({ example: faker.date.recent().toISOString() })
    @Expose()
    @IsDate()
    updatedAt: Date;

    // ── Excluded fields (never sent to client) ────────────────────────────────

    @ApiHideProperty()
    @Exclude()
    passwordHash: string;

    @ApiHideProperty()
    @Exclude()
    pushToken: string | null;
}

export class UserGetProfileResponseDto extends UserResponseDto {}
export class UserUpdateProfileResponseDto extends UserResponseDto {}
