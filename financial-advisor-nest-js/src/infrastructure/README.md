# Infrastructure Layer

This is the **outermost layer** in the onion architecture. It contains all external dependencies and infrastructure concerns.

## Purpose

- Implements interfaces defined in inner layers (domain/application)
- Handles database access, external APIs, file systems, etc.
- Can be replaced without affecting business logic

## Current Structure

```
infrastructure/
├── repositories/
│   └── in-memory-transaction.repository.ts  # Unified in-memory implementation
└── infrastructure.module.ts                 # Provides repository implementations
```

**Note:** `InMemoryTransactionRepository` implements both:
- `TransactionRepository` (for Transaction CRUD)
- `ISummationRepository` (for Summation queries)

This provides a unified data source for all features.

## Dependency Direction

```
Infrastructure Layer
       │
       │ implements
       ▼
Core Layer (Interfaces)
       ▲
       │ depends on
       │
Application Layer (Services)
```

## Adding New Infrastructure

### Replacing In-Memory with Real Database (TypeORM Example)

When ready to implement a real database, follow these steps:

1. **Create entity** in `infrastructure/entities/`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Transaction } from '../../core';

@Entity('transactions')
export class TransactionEntity implements Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  type: TransactionType;

  @Column('timestamp')
  date: Date;

  @Column({ nullable: true })
  description?: string;
}
```

2. **Create repository** in `infrastructure/repositories/`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionRepository, ISummationRepository } from '../../core';

@Injectable()
export class TypeOrmTransactionRepository
  implements TransactionRepository, ISummationRepository {

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  // TransactionRepository methods
  async save(transaction: Transaction): Promise<void> {
    await this.repo.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.repo.find();
  }

  // ISummationRepository methods
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ISummationTransaction[]> {
    return this.repo.find({
      where: { date: Between(startDate, endDate) },
    });
  }
}
```

3. **Update InfrastructureModule**:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmTransactionRepository } from './repositories/typeorm-transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
  ],
  providers: [
    TypeOrmTransactionRepository,
    {
      provide: 'ISummationRepository',
      useExisting: TypeOrmTransactionRepository,
    },
    {
      provide: 'TransactionRepository',
      useExisting: TypeOrmTransactionRepository,
    },
  ],
  exports: ['ISummationRepository', 'TransactionRepository'],
})
export class InfrastructureModule {}
```

## Benefits

- **Swappable**: Change from in-memory → PostgreSQL → MongoDB without touching business logic
- **Testable**: Use mock repository in tests, real repository in production
- **Independent**: Infrastructure changes don't ripple into domain layer
