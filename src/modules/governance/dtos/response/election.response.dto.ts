import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CandidateResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() name: string;
    @ApiProperty() nameAr: string;
    @ApiPropertyOptional() statement?: string | null;
    @ApiPropertyOptional() statementAr?: string | null;
    @ApiPropertyOptional() photoUrl?: string | null;
    @ApiPropertyOptional({
        description: 'Vote count — only shown when resultsOpen = true',
    })
    voteCount?: number;
}

export class ElectionResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() title: string;
    @ApiProperty() titleAr: string;
    @ApiPropertyOptional() description?: string | null;
    @ApiProperty() expiresAt: Date;
    @ApiProperty({
        description: 'True when expiresAt has passed and results are visible',
    })
    resultsOpen: boolean;
    @ApiProperty() createdAt: Date;
    @ApiProperty({ type: [CandidateResponseDto] })
    candidates: CandidateResponseDto[];
    @ApiPropertyOptional({
        description: 'Your voted candidate ID (authenticated users)',
    })
    myVoteCandidateId?: string | null;
}

export class ElectionListResponseDto {
    @ApiProperty({ type: [ElectionResponseDto] }) items: ElectionResponseDto[];
    @ApiPropertyOptional() nextCursor?: string;
}
