import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

/**
 * Transactions module - Application layer
 * Contains business logic for Transaction CRUD operations
 *
 * Dependencies:
 * - Imports InfrastructureModule to access TransactionRepository implementation via DI
 * - Uses TransactionRepository interface (defined in core)
 * - No direct dependencies on concrete implementations (follows clean architecture)
 */
@Module({
  imports: [InfrastructureModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
