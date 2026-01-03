import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummationModule } from './application/summation/summation.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TransactionsModule } from './application/transactions/transactions.module';

/**
 * App module - Composition root
 * Wires together all layers following onion/clean architecture:
 *
 * Layer structure (innermost to outermost):
 * 1. CoreModule: Domain entities and repository contracts
 * 2. InfrastructureModule: Repository implementations and external dependencies
 * 3. Application Modules (SummationModule, TransactionsModule): Use cases and business logic
 * 4. AppController/AppService: Entry point for API
 *
 * Dependency injection happens here:
 * - Repositories are implemented in infrastructure and injected into application modules.
 * - Application modules consume these implementations via interfaces from core.
 *
 * IMPORTANT: InfrastructureModule must be imported before application modules
 * to ensure repository providers are available for DI.
 */
@Module({
  imports: [
    InfrastructureModule, // Must come first for DI of repository implementations
    SummationModule, // Uses repositories via DI
    TransactionsModule, // Financial transactions module
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [InfrastructureModule], // Make repositories globally available if needed
})
export class AppModule {}
