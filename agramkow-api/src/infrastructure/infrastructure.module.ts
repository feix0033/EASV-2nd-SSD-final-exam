import { Module } from '@nestjs/common';
import { CoreModule } from '../core';
import { InMemoryTransactionRepository } from './repositories/in-memory-transaction.repository';

/**
 * Infrastructure module - provides concrete implementations of repositories
 * This is the outermost layer in onion architecture
 *
 * Dependencies:
 * - Imports CoreModule to access domain interfaces
 * - Implements repository interfaces defined in core
 *
 * Current implementation:
 * - InMemoryTransactionRepository implements both TransactionRepository and ISummationRepository
 * - Provides a unified data source for Transaction CRUD and Summation features
 *
 * Todo: Replace InMemoryTransactionRepository with real database implementation (TypeORM, Prisma, etc.)
 */
@Module({
  imports: [CoreModule],
  providers: [
    InMemoryTransactionRepository,
    {
      provide: 'ISummationRepository',
      useExisting: InMemoryTransactionRepository,
    },
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
  ],
  exports: ['ISummationRepository', 'TransactionRepository'],
})
export class InfrastructureModule {}
