# Core Module - Domain Layer

This is the **innermost layer** in the onion architecture. It contains the domain model and business rules.

## Purpose

- Define domain entities and value objects
- Define repository contracts (interfaces)
- Contains pure business logic with NO dependencies on outer layers
- All other layers depend on this layer

## Current Structure

```text
core/
├── domain/                                  # Domain entities
│   ├── summation-transaction.interface.ts  # Summation-specific interface
│   └── transaction.model.ts                # Complete Transaction model
├── repositories/                            # Repository contracts
│   ├── summation-repository.interface.ts   # Summation queries
│   └── transaction-repository.interface.ts # Transaction CRUD
├── core.module.ts                           # Module definition
├── index.ts                                 # Barrel exports
└── README.md
```

## Dependency Rules

```text
✗ Core CANNOT depend on:
  - Application layer (summation module)
  - Infrastructure layer
  - External libraries (except TypeScript/NestJS decorators)

✓ Core CAN:
  - Define interfaces
  - Define domain logic
  - Be imported by all other layers
```

## Adding New Domain Models

As your domain grows, add new entities here:

### 1. Create Domain Entity

```typescript
// core/domain/budget.interface.ts
export interface IBudget {
  id: string;
  amount: number;
  category: string;
  period: string;
}
```

### 2. Create Repository Contract

```typescript
// core/repositories/budget-repository.interface.ts
import { IBudget } from '../domain/budget.interface';

export interface IBudgetRepository {
  findByCategory(category: string): Promise<IBudget[]>;
  save(budget: IBudget): Promise<IBudget>;
}
```

### 3. Export from Barrel

```typescript
// core/index.ts
export * from './domain/budget.interface';
export * from './repositories/budget-repository.interface';
```

### 4. Implement in Infrastructure

```typescript
// infrastructure/repositories/budget.repository.ts
import { IBudgetRepository, IBudget } from '../../core';

@Injectable()
export class BudgetRepository implements IBudgetRepository {
  // Implementation here
}
```

## Key Principles

1. **Technology Agnostic**: No database, framework, or external library dependencies
2. **Stable**: Changes here affect all layers - keep stable
3. **Pure**: Contains only business logic and domain rules
4. **Interface-First**: Define contracts, let outer layers implement

## Benefits

- **Testable**: Domain logic can be tested without infrastructure
- **Portable**: Can move to different frameworks/databases
- **Clear**: Business rules are explicit and isolated
- **Flexible**: Multiple implementations of same interface
