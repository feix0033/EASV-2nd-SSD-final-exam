import { Transaction } from '../domain/transaction.model';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  update(
    id: string,
    transaction: Partial<Transaction>,
  ): Promise<Transaction | null>;
  delete(id: string): Promise<boolean>;
}
