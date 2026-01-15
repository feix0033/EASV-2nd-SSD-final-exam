import { Module } from '@nestjs/common';

/**
 * Core module - Domain layer (innermost layer in onion architecture)
 *
 * Contains:
 * - Domain entities and value objects
 * - Domain repository interfaces (contracts)
 * - Domain logic and rules
 *
 * This module has NO dependencies on other layers.
 * Other layers depend on this module.
 *
 * Note: This module only exports types/interfaces, no providers needed.
 */
@Module({})
export class CoreModule {}
