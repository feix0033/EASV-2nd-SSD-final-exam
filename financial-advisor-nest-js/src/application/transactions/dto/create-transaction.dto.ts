import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../core/domain/transaction.model';

export class CreateTransactionDto {
  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ example: '2025-01-01' })
  date: string;

  @ApiProperty({ example: 'Salary', required: false })
  description?: string;
}
