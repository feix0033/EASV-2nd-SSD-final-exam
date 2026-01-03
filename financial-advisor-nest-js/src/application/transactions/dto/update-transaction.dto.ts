import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../core/domain/transaction.model';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 100 })
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionType })
  type?: TransactionType;

  @ApiPropertyOptional({ example: '2025-01-01' })
  date?: string;

  @ApiPropertyOptional({ example: 'Salary' })
  description?: string;
}
