import { TransactionType } from '../../../core/domain/transaction.model';

export class TransactionResultDto {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
}
