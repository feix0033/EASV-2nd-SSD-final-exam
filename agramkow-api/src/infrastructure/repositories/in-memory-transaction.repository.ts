import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../core/repositories/transaction-repository.interface';
import { ISummationRepository } from '../../core/repositories/summation-repository.interface';
import { ISummationTransaction } from '../../core/domain/summation-transaction.interface';
import {
  Transaction,
  TransactionType,
} from '../../core/domain/transaction.model';

@Injectable()
export class InMemoryTransactionRepository
  implements TransactionRepository, ISummationRepository
{
  private transactions: Transaction[] = [
    {
      id: '1',
      amount: 1000,
      type: TransactionType.INCOME,
      date: new Date('2025-01-01'),
      description: 'Salary',
    },
    {
      id: '2',
      amount: -50,
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-02'),
      description: 'Groceries',
    },
    {
      id: '3',
      amount: -200,
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-03'),
      description: 'Utilities',
    },
  ];

  save(transaction: Transaction): Promise<void> {
    this.transactions.push({ ...transaction });
    return Promise.resolve();
  }

  findAll(): Promise<Transaction[]> {
    return Promise.resolve(this.transactions.map((t) => ({ ...t })));
  }

  findById(id: string): Promise<Transaction | null> {
    const transaction = this.transactions.find((t) => t.id === id);
    return Promise.resolve(transaction ? { ...transaction } : null);
  }

  update(
    id: string,
    transactionUpdate: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return Promise.resolve(null);

    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionUpdate,
    };
    return Promise.resolve({ ...this.transactions[index] });
  }

  delete(id: string): Promise<boolean> {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return Promise.resolve(false);

    this.transactions.splice(index, 1);
    return Promise.resolve(true);
  }

  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ISummationTransaction[]> {
    return Promise.resolve(
      this.transactions
        .filter(
          (transaction) =>
            transaction.date >= startDate && transaction.date <= endDate,
        )
        .map((t) => ({ ...t })),
    );
  }
}
