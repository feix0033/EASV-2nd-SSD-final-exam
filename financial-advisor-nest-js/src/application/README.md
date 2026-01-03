# Application Layer

This is the **application/use case layer** in the onion architecture. It contains business logic and orchestrates the flow of data.

## Purpose

- Implements use cases and business workflows
- Orchestrates domain entities and repositories
- Contains application-specific logic (DTOs, controllers, services)
- Depends on core layer, independent of infrastructure

## Current Structure

```
application/
├── summation/                    # Summation feature
│   ├── dto/                      # Data transfer objects
│   ├── enums/                    # Application-specific enums
│   ├── summation.controller.ts   # HTTP endpoints
│   ├── summation.service.ts      # Business logic
│   ├── summation.module.ts       # Feature module
│   └── README.md
└── transactions/                 # Transaction CRUD feature
    ├── dto/                      # DTOs for transactions
    ├── transactions.controller.ts
    ├── transactions.service.ts
    └── transactions.module.ts
```

## Dependency Rules

```
✓ Application CAN depend on:
  - Core layer (domain entities, repository interfaces)

✗ Application CANNOT depend on:
  - Infrastructure layer (implementations)
  - External frameworks (beyond NestJS decorators)

✓ Application CAN:
  - Define DTOs and view models
  - Implement use cases
  - Inject repository interfaces (from core)
```

## Adding New Features

When adding new features to the application layer:

### 1. Create Feature Module

```bash
mkdir -p src/application/budgeting
```

### 2. Structure the Feature

```
application/
├── summation/
└── budgeting/              # New feature
    ├── dto/
    │   ├── budget-query.dto.ts
    │   └── budget-result.dto.ts
    ├── budgeting.controller.ts
    ├── budgeting.service.ts
    ├── budgeting.module.ts
    └── README.md
```

### 3. Import InfrastructureModule for DI

```typescript
// application/budgeting/budgeting.module.ts
import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { BudgetingService } from './budgeting.service';
import { BudgetingController } from './budgeting.controller';

@Module({
  imports: [InfrastructureModule], // Access repository implementations via DI
  controllers: [BudgetingController],
  providers: [BudgetingService],
  exports: [BudgetingService],
})
export class BudgetingModule {}
```

### 4. Wire in App Module

```typescript
// app.module.ts
@Module({
  imports: [
    InfrastructureModule,
    SummationModule,
    BudgetingModule, // Add new feature
  ],
  // ...
})
export class AppModule {}
```

## Key Principles

1. **Feature-based organization**: Each feature is a self-contained module
2. **Use case driven**: Services implement specific use cases
3. **DTO transformation**: Controllers transform between domain and API models
4. **Infrastructure agnostic**: No direct database or external service calls

## Benefits

- **Organized**: Features are clearly separated
- **Scalable**: Easy to add new features
- **Testable**: Business logic isolated from infrastructure
- **Clear boundaries**: Each feature has its own module
