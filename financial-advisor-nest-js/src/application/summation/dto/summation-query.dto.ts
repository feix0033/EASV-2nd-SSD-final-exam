import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { GroupBy } from '../enums/group-by.enum';
import { Period } from '../enums/period.enum';

export class SummationQueryDto {
  @ApiProperty({
    enum: GroupBy,
    required: false,
    description: 'How to group/aggregate results (default: month)',
    example: 'day',
  })
  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;

  @ApiProperty({
    enum: Period,
    required: false,
    description:
      'Time period/range relative to now (if provided, startDate/endDate are ignored)',
    example: 'yesterday',
  })
  @IsOptional()
  @IsEnum(Period)
  period?: Period;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Start date (only used if period is not provided)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    type: String,
    required: false,
    description: 'End date (only used if period is not provided)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
