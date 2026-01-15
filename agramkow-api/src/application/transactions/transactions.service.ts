import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../core/domain/transaction.model';
import { TransactionRepository } from '../../core/repositories/transaction-repository.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('TransactionRepository')
    private readonly repository: TransactionRepository,
  ) {}

  async add(transaction: Transaction): Promise<void> {
    await this.repository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findById(id);
  }

  async update(
    id: string,
    data: Partial<Omit<Transaction, 'id'>>,
  ): Promise<Transaction | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
