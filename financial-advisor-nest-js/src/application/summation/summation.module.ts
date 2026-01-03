import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { SummationService } from './summation.service';
import { SummationController } from './summation.controller';

/**
 * Summation module - Application layer
 * Contains business logic, use cases, DTOs, and controllers
 *
 * Dependencies:
 * - Imports InfrastructureModule to access repository implementations via DI
 * - Uses ISummationRepository interface (defined in core)
 * - No direct dependencies on concrete implementations (still follows onion architecture)
 *
 * Note: Importing InfrastructureModule for DI is acceptable in NestJS.
 * The code still depends only on interfaces, not implementations.
 */
@Module({
  imports: [InfrastructureModule],
  controllers: [SummationController],
  providers: [SummationService],
  exports: [SummationService],
})
export class SummationModule {}
