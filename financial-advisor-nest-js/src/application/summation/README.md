# Summation Service

A decoupled service for calculating financial summations grouped by different time durations (day, week, month, year).

## Architecture

This project follows **Onion Architecture** (Clean Architecture) principles:

### Onion Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  Infrastructure Layer (src/infrastructure/)             │
│  - MockSummationRepository (implements interfaces)      │
│  - Database implementations (Todo)                      │
│  - External service integrations (Todo)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Application Layer (src/summation/)              │  │
│  │  - Controllers (Presentation)                     │  │
│  │  - Services (Business Logic)                      │  │
│  │  - DTOs (Data Transfer Objects)                   │  │
│  │  - Enums (Duration, SemanticDuration)            │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Core/Domain Layer (src/core/)             │ │  │
│  │  │  - ISummationRecord (domain entity)        │ │  │
│  │  │  - ISummationRepository (domain contract)  │ │  │
│  │  │  - Domain logic and rules                  │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
       ▲
       │ Dependency direction: Outer layers depend on inner layers
       │ Core layer has ZERO dependencies on outer layers
```

### Dependency Flow

```
InfrastructureModule ──imports──▶ CoreModule (implements interfaces)
                                       ▲
                                       │
SummationModule      ──imports──▶ CoreModule (uses interfaces)
                                       ▲
                                       │
AppModule (Composition Root)    ──wires all modules together
```

All modules depend on `CoreModule`, but `CoreModule` depends on nothing!

### Key Principles

1. **Dependency Inversion**: Inner layers define interfaces, outer layers implement them
2. **Separation of Concerns**: Each layer has a single responsibility
3. **Testability**: Business logic is independent of infrastructure
4. **Flexibility**: Can swap implementations without touching business logic

## Directory Structure

```
src/
├── core/                         # Domain Layer (innermost - most stable)
│   ├── domain/
│   │   └── summation-record.interface.ts
│   ├── repositories/
│   │   └── summation-repository.interface.ts
│   ├── core.module.ts
│   ├── index.ts                  # Barrel exports
│   └── README.md
│
├── summation/                    # Application Layer
│   ├── dto/
│   │   ├── summation-query.dto.ts
│   │   └── summation-result.dto.ts
│   ├── enums/
│   │   ├── duration.enum.ts
│   │   └── semantic-duration.enum.ts
│   ├── summation.controller.ts
│   ├── summation.service.ts
│   ├── summation.module.ts
│   └── README.md
│
├── infrastructure/               # Infrastructure Layer (outermost - most volatile)
│   ├── repositories/
│   │   └── mock-summation.repository.ts
│   ├── infrastructure.module.ts
│   └── README.md
│
└── app.module.ts                 # Composition root (wires everything)
```

## Key Concepts

### 1. Interface-Based Design

The service depends on **interfaces**, not concrete implementations:

```typescript
// Service only knows about the interface
constructor(
  @Inject('ISummationRepository')
  private readonly repository: ISummationRepository,
) {}
```

### 2. Implementation Todos

Todo: Implement real infrastructure in `src/infrastructure/`:

1. **Create the actual entity/model** in `src/infrastructure/entities/` (e.g., with TypeORM):

```typescript
@Entity('transactions')
export class Transaction implements ISummationRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  amount: number;

  @Column('timestamp')
  date: Date;

  // ... other fields
}
```

2. **Implement the repository** in `src/infrastructure/repositories/`:

```typescript
// src/infrastructure/repositories/transaction.repository.ts
@Injectable()
export class TransactionRepository implements ISummationRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ISummationRecord[]> {
    return this.repo.find({
      where: {
        date: Between(startDate, endDate),
      },
    });
  }

  async findAll(): Promise<ISummationRecord[]> {
    return this.repo.find();
  }
}
```

3. **Update infrastructure module** in `src/infrastructure/infrastructure.module.ts`:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [
    {
      provide: 'ISummationRepository',
      useClass: TransactionRepository, // Replace MockSummationRepository
    },
  ],
  exports: ['ISummationRepository'],
})
export class InfrastructureModule {}
```

Note: No changes needed in SummationModule - it remains infrastructure-agnostic!

## Usage

### API Endpoints

#### 1. Get Total Summation (All Records)

```bash
# Default: monthly summation of all data
GET /summation

# With specific duration
GET /summation?duration=week

# Using semantic duration (today, yesterday, lastweek, lastmonth, lastyear)
GET /summation?semanticDuration=today
GET /summation?semanticDuration=lastweek&duration=day
GET /summation?semanticDuration=lastmonth

# Custom date range
GET /summation?startDate=2024-01-01&endDate=2024-12-31&duration=month
```

#### 2. Get Income Summation (Positive Values Only)

```bash
# Monthly income for last month
GET /summation/income?semanticDuration=lastmonth

# Daily income for this week
GET /summation/income?semanticDuration=thisweek&duration=day

# Custom date range
GET /summation/income?startDate=2024-01-01&endDate=2024-12-31
```

#### 3. Get Expenses Summation (Negative Values Only)

```bash
# Monthly expenses for last month
GET /summation/expenses?semanticDuration=lastmonth

# Daily expenses for today
GET /summation/expenses?semanticDuration=today&duration=day

# Custom date range
GET /summation/expenses?startDate=2024-01-01&endDate=2024-12-31
```

### Supported Semantic Durations

- `today` - Current day
- `yesterday` - Previous day
- `thisweek` - Current week (Monday to today)
- `lastweek` - Previous week (Monday to Sunday)
- `thismonth` - Current month (1st to today)
- `lastmonth` - Previous month (full month)
- `thisyear` - Current year (Jan 1st to today)
- `lastyear` - Previous year (full year)

### Supported Grouping Durations

- `day` - Group by day
- `week` - Group by ISO week
- `month` - Group by month (default)
- `year` - Group by year

### Response Format

```json
[
  {
    "period": "2024-01",
    "total": 450,
    "count": 3,
    "startDate": "2024-01-05T00:00:00.000Z",
    "endDate": "2024-01-20T00:00:00.000Z"
  },
  {
    "period": "2024-02",
    "total": 550,
    "count": 2,
    "startDate": "2024-02-03T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z"
  }
]
```

## Benefits of This Design

1. **Decoupling**: Service logic is independent of data storage
2. **Testability**: Easy to mock the repository in tests
3. **Flexibility**: Can swap out data sources (SQL, NoSQL, API, etc.) without changing service logic
4. **Team Collaboration**: Business logic and data layer can be developed independently
5. **Type Safety**: Interfaces ensure contract compliance

## Testing Example

```typescript
describe('SummationService', () => {
  let service: SummationService;
  let mockRepository: ISummationRepository;

  beforeEach(async () => {
    mockRepository = {
      findByDateRange: jest.fn(),
      findAll: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        SummationService,
        {
          provide: 'ISummationRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SummationService>(SummationService);
  });

  // ... tests
});
```
