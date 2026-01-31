import { Test, TestingModule } from '@nestjs/testing';
import { ISummationRepository, ISummationTransaction } from '../../core';
import { SummationService } from './summation.service';
import { SummationQueryDto } from './dto/summation-query.dto';
import { GroupBy } from './enums/group-by.enum';
import { Period } from './enums/period.enum';

describe('SummationService', () => {
  let service: SummationService;
  let mockRepository: jest.Mocked<ISummationRepository>;

  // Test data fixtures
  const mockTransactions: ISummationTransaction[] = [
    {
      amount: 100,
      date: new Date('2024-01-15'),
    },
    {
      amount: -50,
      date: new Date('2024-01-20'),
    },
    {
      amount: 200,
      date: new Date('2024-02-10'),
    },
    {
      amount: -75,
      date: new Date('2024-02-15'),
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      findByDateRange: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
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

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have repository injected', () => {
      expect(mockRepository).toBeDefined();
    });
  });

  describe('calculateSumByDuration', () => {
    beforeEach(() => {
      mockRepository.findByDateRange.mockResolvedValue(mockTransactions);
    });

    describe('Basic Functionality', () => {
      it('should return an array of results', async () => {
        const query: SummationQueryDto = {};
        const result = await service.calculateSumByDuration(query);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should call repository.findByDateRange once', async () => {
        const query: SummationQueryDto = {};
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalledTimes(1);
      });

      it('should return empty array when no transactions found', async () => {
        mockRepository.findByDateRange.mockResolvedValue([]);
        const query: SummationQueryDto = {};
        const result = await service.calculateSumByDuration(query);

        expect(result).toEqual([]);
      });
    });

    describe('Group By Month (Default)', () => {
      it('should group transactions by month when no groupBy specified', async () => {
        const query: SummationQueryDto = {};
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(2);
        expect(result[0].period).toMatch(/^\d{4}-\d{2}$/);
      });

      it('should group transactions by month when groupBy is MONTH', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(2);
        expect(result.some((r) => r.period === '2024-01')).toBe(true);
        expect(result.some((r) => r.period === '2024-02')).toBe(true);
      });

      it('should calculate correct totals for each month', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.calculateSumByDuration(query);

        const jan = result.find((r) => r.period === '2024-01');
        const feb = result.find((r) => r.period === '2024-02');

        expect(jan?.total).toBe(50); // 100 + (-50)
        expect(feb?.total).toBe(125); // 200 + (-75)
      });

      it('should include transaction count in results', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.calculateSumByDuration(query);

        expect(result[0].count).toBeDefined();
        expect(result[0].count).toBeGreaterThan(0);
      });

      it('should include startDate and endDate in results', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.calculateSumByDuration(query);

        expect(result[0].startDate).toBeInstanceOf(Date);
        expect(result[0].endDate).toBeInstanceOf(Date);
      });
    });

    describe('Group By Day', () => {
      it('should group transactions by day when groupBy is DAY', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.DAY };
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(4);
        expect(result[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('should handle multiple transactions on the same day', async () => {
        const sameDay = new Date('2024-01-15');
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 100, date: sameDay },
          { amount: 50, date: sameDay },
        ]);

        const query: SummationQueryDto = { groupBy: GroupBy.DAY };
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(1);
        expect(result[0].total).toBe(150);
        expect(result[0].count).toBe(2);
      });
    });

    describe('Group By Week', () => {
      it('should group transactions by week when groupBy is WEEK', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.WEEK };
        const result = await service.calculateSumByDuration(query);

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].period).toMatch(/^\d{4}-W\d{2}$/);
      });

      it('should use ISO week number format', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.WEEK };
        const result = await service.calculateSumByDuration(query);

        result.forEach((r) => {
          expect(r.period).toMatch(/^\d{4}-W\d{2}$/);
        });
      });

      it('should handle year transitions correctly', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 100, date: new Date('2023-12-30') },
          { amount: 50, date: new Date('2024-01-02') },
        ]);

        const query: SummationQueryDto = { groupBy: GroupBy.WEEK };
        const result = await service.calculateSumByDuration(query);

        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Group By Year', () => {
      it('should group transactions by year when groupBy is YEAR', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.YEAR };
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(1);
        expect(result[0].period).toBe('2024');
      });

      it('should calculate correct totals across multiple years', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 100, date: new Date('2023-01-15') },
          { amount: 200, date: new Date('2024-01-15') },
        ]);

        const query: SummationQueryDto = { groupBy: GroupBy.YEAR };
        const result = await service.calculateSumByDuration(query);

        expect(result).toHaveLength(2);
        const year2023 = result.find((r) => r.period === '2023');
        const year2024 = result.find((r) => r.period === '2024');
        expect(year2023?.total).toBe(100);
        expect(year2024?.total).toBe(200);
      });
    });

    describe('Date Range Handling', () => {
      it('should use provided startDate and endDate', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const query: SummationQueryDto = { startDate, endDate };

        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
          startDate,
          endDate,
        );
      });

      it('should default to epoch when startDate not provided', async () => {
        const query: SummationQueryDto = {};
        await service.calculateSumByDuration(query);

        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        expect(startDate.getTime()).toBe(new Date(0).getTime());
      });

      it('should default to current date when endDate not provided', async () => {
        const query: SummationQueryDto = {};
        await service.calculateSumByDuration(query);

        const [[, endDate]] = mockRepository.findByDateRange.mock.calls;
        const now = new Date();
        expect(endDate.getDate()).toBe(now.getDate());
      });
    });

    describe('Period Presets', () => {
      it('should handle TODAY period', async () => {
        const query: SummationQueryDto = { period: Period.TODAY };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
        const [[startDate, endDate]] =
          mockRepository.findByDateRange.mock.calls;
        expect(startDate.getDate()).toBe(new Date().getDate());
        expect(endDate.getDate()).toBe(new Date().getDate());
      });

      it('should handle YESTERDAY period', async () => {
        const query: SummationQueryDto = { period: Period.YESTERDAY };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(startDate.getDate()).toBe(yesterday.getDate());
      });

      it('should handle THIS_WEEK period', async () => {
        const query: SummationQueryDto = { period: Period.THIS_WEEK };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
      });

      it('should handle LAST_WEEK period', async () => {
        const query: SummationQueryDto = { period: Period.LAST_WEEK };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
      });

      it('should handle THIS_MONTH period', async () => {
        const query: SummationQueryDto = { period: Period.THIS_MONTH };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        expect(startDate.getDate()).toBe(1);
      });

      it('should handle LAST_MONTH period', async () => {
        const query: SummationQueryDto = { period: Period.LAST_MONTH };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
      });

      it('should handle THIS_YEAR period', async () => {
        const query: SummationQueryDto = { period: Period.THIS_YEAR };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        expect(startDate.getMonth()).toBe(0);
        expect(startDate.getDate()).toBe(1);
      });

      it('should handle LAST_YEAR period', async () => {
        const query: SummationQueryDto = { period: Period.LAST_YEAR };
        await service.calculateSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        expect(startDate.getFullYear()).toBe(new Date().getFullYear() - 1);
      });

      it('should prioritize period over startDate/endDate when both provided', async () => {
        const query: SummationQueryDto = {
          period: Period.TODAY,
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-12-31'),
        };

        await service.calculateSumByDuration(query);

        const [[startDate]] = mockRepository.findByDateRange.mock.calls;
        expect(startDate.getDate()).toBe(new Date().getDate());
      });
    });
  });

  describe('getIncomeSumByDuration', () => {
    beforeEach(() => {
      mockRepository.findByDateRange.mockResolvedValue(mockTransactions);
    });

    describe('Basic Functionality', () => {
      it('should return only positive amount transactions', async () => {
        const query: SummationQueryDto = {};
        const result = await service.getIncomeSumByDuration(query);

        result.forEach((r) => {
          expect(r.total).toBeGreaterThanOrEqual(0);
        });
      });

      it('should filter out negative amounts', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.getIncomeSumByDuration(query);

        const jan = result.find((r) => r.period === '2024-01');
        expect(jan?.total).toBe(100); // Only positive 100, not -50
      });

      it('should filter out zero amounts', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 0, date: new Date('2024-01-15') },
          { amount: 100, date: new Date('2024-01-20') },
        ]);

        const query: SummationQueryDto = {};
        const result = await service.getIncomeSumByDuration(query);

        expect(result[0].count).toBe(1);
      });

      it('should return empty array when no income transactions', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: -50, date: new Date('2024-01-15') },
          { amount: -75, date: new Date('2024-01-20') },
        ]);

        const query: SummationQueryDto = {};
        const result = await service.getIncomeSumByDuration(query);

        expect(result).toEqual([]);
      });
    });

    describe('Grouping and Calculation', () => {
      it('should group income by default groupBy (MONTH)', async () => {
        const query: SummationQueryDto = {};
        const result = await service.getIncomeSumByDuration(query);

        expect(result[0].period).toMatch(/^\d{4}-\d{2}$/);
      });

      it('should calculate correct income totals per period', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.getIncomeSumByDuration(query);

        const jan = result.find((r) => r.period === '2024-01');
        const feb = result.find((r) => r.period === '2024-02');

        expect(jan?.total).toBe(100);
        expect(feb?.total).toBe(200);
      });

      it('should work with different groupBy options', async () => {
        const queryDay: SummationQueryDto = { groupBy: GroupBy.DAY };
        const resultDay = await service.getIncomeSumByDuration(queryDay);

        const queryYear: SummationQueryDto = { groupBy: GroupBy.YEAR };
        const resultYear = await service.getIncomeSumByDuration(queryYear);

        expect(resultDay[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(resultYear[0].period).toMatch(/^\d{4}$/);
      });
    });

    describe('Date Range Handling', () => {
      it('should respect startDate and endDate', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const query: SummationQueryDto = { startDate, endDate };

        await service.getIncomeSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
          startDate,
          endDate,
        );
      });

      it('should work with period presets', async () => {
        const query: SummationQueryDto = { period: Period.THIS_MONTH };
        await service.getIncomeSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
      });
    });
  });

  describe('getExpensesSumByDuration', () => {
    beforeEach(() => {
      mockRepository.findByDateRange.mockResolvedValue(mockTransactions);
    });

    describe('Basic Functionality', () => {
      it('should return only negative amount transactions', async () => {
        const query: SummationQueryDto = {};
        const result = await service.getExpensesSumByDuration(query);

        result.forEach((r) => {
          expect(r.total).toBeLessThanOrEqual(0);
        });
      });

      it('should filter out positive amounts', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.getExpensesSumByDuration(query);

        const jan = result.find((r) => r.period === '2024-01');
        expect(jan?.total).toBe(-50); // Only negative -50, not 100
      });

      it('should filter out zero amounts', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 0, date: new Date('2024-01-15') },
          { amount: -50, date: new Date('2024-01-20') },
        ]);

        const query: SummationQueryDto = {};
        const result = await service.getExpensesSumByDuration(query);

        expect(result[0].count).toBe(1);
      });

      it('should return empty array when no expense transactions', async () => {
        mockRepository.findByDateRange.mockResolvedValue([
          { amount: 100, date: new Date('2024-01-15') },
          { amount: 200, date: new Date('2024-01-20') },
        ]);

        const query: SummationQueryDto = {};
        const result = await service.getExpensesSumByDuration(query);

        expect(result).toEqual([]);
      });
    });

    describe('Grouping and Calculation', () => {
      it('should group expenses by default groupBy (MONTH)', async () => {
        const query: SummationQueryDto = {};
        const result = await service.getExpensesSumByDuration(query);

        expect(result[0].period).toMatch(/^\d{4}-\d{2}$/);
      });

      it('should calculate correct expense totals per period', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.getExpensesSumByDuration(query);

        const jan = result.find((r) => r.period === '2024-01');
        const feb = result.find((r) => r.period === '2024-02');

        expect(jan?.total).toBe(-50);
        expect(feb?.total).toBe(-75);
      });

      it('should preserve negative values in totals', async () => {
        const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
        const result = await service.getExpensesSumByDuration(query);

        result.forEach((r) => {
          expect(r.total).toBeLessThanOrEqual(0);
        });
      });

      it('should work with different groupBy options', async () => {
        const queryDay: SummationQueryDto = { groupBy: GroupBy.DAY };
        const resultDay = await service.getExpensesSumByDuration(queryDay);

        const queryYear: SummationQueryDto = { groupBy: GroupBy.YEAR };
        const resultYear = await service.getExpensesSumByDuration(queryYear);

        expect(resultDay[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(resultYear[0].period).toMatch(/^\d{4}$/);
      });
    });

    describe('Date Range Handling', () => {
      it('should respect startDate and endDate', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const query: SummationQueryDto = { startDate, endDate };

        await service.getExpensesSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
          startDate,
          endDate,
        );
      });

      it('should work with period presets', async () => {
        const query: SummationQueryDto = { period: Period.THIS_MONTH };
        await service.getExpensesSumByDuration(query);

        expect(mockRepository.findByDateRange).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transaction list', async () => {
      mockRepository.findByDateRange.mockResolvedValue([]);
      const query: SummationQueryDto = {};
      const result = await service.calculateSumByDuration(query);

      expect(result).toEqual([]);
    });

    it('should handle single transaction', async () => {
      mockRepository.findByDateRange.mockResolvedValue([
        { amount: 100, date: new Date('2024-01-15') },
      ]);

      const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
      const result = await service.calculateSumByDuration(query);

      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(100);
      expect(result[0].count).toBe(1);
    });

    it('should handle transactions with same date and time', async () => {
      const sameDate = new Date('2024-01-15T10:30:00');
      mockRepository.findByDateRange.mockResolvedValue([
        { amount: 100, date: sameDate },
        { amount: 200, date: sameDate },
      ]);

      const query: SummationQueryDto = { groupBy: GroupBy.DAY };
      const result = await service.calculateSumByDuration(query);

      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(300);
      expect(result[0].count).toBe(2);
    });

    it('should handle very large transaction amounts', async () => {
      mockRepository.findByDateRange.mockResolvedValue([
        { amount: 1000000000, date: new Date('2024-01-15') },
        { amount: -500000000, date: new Date('2024-01-20') },
      ]);

      const query: SummationQueryDto = { groupBy: GroupBy.MONTH };
      const result = await service.calculateSumByDuration(query);

      expect(result[0].total).toBe(500000000);
    });

    it('should handle very old dates', async () => {
      mockRepository.findByDateRange.mockResolvedValue([
        { amount: 100, date: new Date('1900-01-15') },
      ]);

      const query: SummationQueryDto = { groupBy: GroupBy.YEAR };
      const result = await service.calculateSumByDuration(query);

      expect(result[0].period).toBe('1900');
    });

    it('should handle future dates', async () => {
      mockRepository.findByDateRange.mockResolvedValue([
        { amount: 100, date: new Date('2030-01-15') },
      ]);

      const query: SummationQueryDto = { groupBy: GroupBy.YEAR };
      const result = await service.calculateSumByDuration(query);

      expect(result[0].period).toBe('2030');
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockRepository.findByDateRange.mockRejectedValue(
        new Error('Database error'),
      );

      const query: SummationQueryDto = {};

      await expect(service.calculateSumByDuration(query)).rejects.toThrow(
        'Database error',
      );
    });

    it('should throw error for unsupported groupBy value', async () => {
      mockRepository.findByDateRange.mockResolvedValue(mockTransactions);
      const query: SummationQueryDto = { groupBy: 'INVALID' as GroupBy };

      await expect(service.calculateSumByDuration(query)).rejects.toThrow(
        'Unsupported groupBy value',
      );
    });

    it('should throw error for unsupported period value', async () => {
      const query: SummationQueryDto = { period: 'INVALID' as Period };

      await expect(service.calculateSumByDuration(query)).rejects.toThrow(
        'Unsupported period value',
      );
    });
  });
});
