import { Test, TestingModule } from '@nestjs/testing';
import { SummationController } from './summation.controller';
import { SummationService } from './summation.service';
import { GroupBy } from './enums/group-by.enum';
import { Period } from './enums/period.enum';
import { SummationResultDto } from './dto/summation-result.dto';

describe('SummationController', () => {
  let controller: SummationController;
  let mockService: jest.Mocked<SummationService>;

  const mockResults: SummationResultDto[] = [
    {
      period: '2024-01',
      total: 100,
      count: 2,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    },
  ];

  beforeEach(async () => {
    mockService = {
      calculateSumByDuration: jest.fn(),
      getIncomeSumByDuration: jest.fn(),
      getExpensesSumByDuration: jest.fn(),
    } as unknown as jest.Mocked<SummationService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummationController],
      providers: [
        {
          provide: SummationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SummationController>(SummationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have service injected', () => {
      expect(mockService).toBeDefined();
    });
  });

  describe('getSummation', () => {
    beforeEach(() => {
      mockService.calculateSumByDuration.mockResolvedValue(mockResults);
    });

    it('should call service with default parameters', async () => {
      await controller.getSummation();

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass groupBy parameter to service', async () => {
      await controller.getSummation(GroupBy.DAY);

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.DAY,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass period parameter to service', async () => {
      await controller.getSummation(undefined, Period.THIS_MONTH);

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: Period.THIS_MONTH,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should convert string dates to Date objects', async () => {
      await controller.getSummation(
        undefined,
        undefined,
        '2024-01-01',
        '2024-01-31',
      );

      const callArgs = mockService.calculateSumByDuration.mock.calls[0][0];
      expect(callArgs.startDate).toBeInstanceOf(Date);
      expect(callArgs.endDate).toBeInstanceOf(Date);
    });

    it('should pass all parameters to service', async () => {
      await controller.getSummation(
        GroupBy.MONTH,
        Period.THIS_MONTH,
        '2024-01-01',
        '2024-01-31',
      );

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.MONTH,
        period: Period.THIS_MONTH,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });
    });

    it('should return service results', async () => {
      const result = await controller.getSummation();

      expect(result).toEqual(mockResults);
    });

    it('should handle undefined date strings', async () => {
      await controller.getSummation(undefined, undefined, undefined, undefined);

      const callArgs = mockService.calculateSumByDuration.mock.calls[0][0];
      expect(callArgs.startDate).toBeUndefined();
      expect(callArgs.endDate).toBeUndefined();
    });
  });

  describe('getIncomeSummation', () => {
    beforeEach(() => {
      mockService.getIncomeSumByDuration.mockResolvedValue(mockResults);
    });

    it('should call service with default parameters', async () => {
      await controller.getIncomeSummation();

      expect(mockService.getIncomeSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass groupBy parameter to service', async () => {
      await controller.getIncomeSummation(GroupBy.WEEK);

      expect(mockService.getIncomeSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.WEEK,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass period parameter to service', async () => {
      await controller.getIncomeSummation(undefined, Period.LAST_MONTH);

      expect(mockService.getIncomeSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: Period.LAST_MONTH,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should convert string dates to Date objects', async () => {
      await controller.getIncomeSummation(
        undefined,
        undefined,
        '2024-02-01',
        '2024-02-29',
      );

      const callArgs = mockService.getIncomeSumByDuration.mock.calls[0][0];
      expect(callArgs.startDate).toBeInstanceOf(Date);
      expect(callArgs.endDate).toBeInstanceOf(Date);
    });

    it('should return service results', async () => {
      const result = await controller.getIncomeSummation();

      expect(result).toEqual(mockResults);
    });

    it('should handle all parameters together', async () => {
      await controller.getIncomeSummation(
        GroupBy.YEAR,
        Period.THIS_YEAR,
        '2024-01-01',
        '2024-12-31',
      );

      expect(mockService.getIncomeSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.YEAR,
        period: Period.THIS_YEAR,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });
    });
  });

  describe('getExpensesSummation', () => {
    beforeEach(() => {
      mockService.getExpensesSumByDuration.mockResolvedValue(mockResults);
    });

    it('should call service with default parameters', async () => {
      await controller.getExpensesSummation();

      expect(mockService.getExpensesSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass groupBy parameter to service', async () => {
      await controller.getExpensesSummation(GroupBy.DAY);

      expect(mockService.getExpensesSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.DAY,
        period: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should pass period parameter to service', async () => {
      await controller.getExpensesSummation(undefined, Period.TODAY);

      expect(mockService.getExpensesSumByDuration).toHaveBeenCalledWith({
        groupBy: undefined,
        period: Period.TODAY,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should convert string dates to Date objects', async () => {
      await controller.getExpensesSummation(
        undefined,
        undefined,
        '2024-03-01',
        '2024-03-31',
      );

      const callArgs = mockService.getExpensesSumByDuration.mock.calls[0][0];
      expect(callArgs.startDate).toBeInstanceOf(Date);
      expect(callArgs.endDate).toBeInstanceOf(Date);
    });

    it('should return service results', async () => {
      const result = await controller.getExpensesSummation();

      expect(result).toEqual(mockResults);
    });

    it('should handle all parameters together', async () => {
      await controller.getExpensesSummation(
        GroupBy.MONTH,
        Period.LAST_YEAR,
        '2023-01-01',
        '2023-12-31',
      );

      expect(mockService.getExpensesSumByDuration).toHaveBeenCalledWith({
        groupBy: GroupBy.MONTH,
        period: Period.LAST_YEAR,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      });
    });
  });

  describe('Service Integration', () => {
    it('should not call unrelated service methods in getSummation', async () => {
      mockService.calculateSumByDuration.mockResolvedValue(mockResults);

      await controller.getSummation();

      expect(mockService.calculateSumByDuration).toHaveBeenCalledTimes(1);
      expect(mockService.getIncomeSumByDuration).not.toHaveBeenCalled();
      expect(mockService.getExpensesSumByDuration).not.toHaveBeenCalled();
    });

    it('should not call unrelated service methods in getIncomeSummation', async () => {
      mockService.getIncomeSumByDuration.mockResolvedValue(mockResults);

      await controller.getIncomeSummation();

      expect(mockService.getIncomeSumByDuration).toHaveBeenCalledTimes(1);
      expect(mockService.calculateSumByDuration).not.toHaveBeenCalled();
      expect(mockService.getExpensesSumByDuration).not.toHaveBeenCalled();
    });

    it('should not call unrelated service methods in getExpensesSummation', async () => {
      mockService.getExpensesSumByDuration.mockResolvedValue(mockResults);

      await controller.getExpensesSummation();

      expect(mockService.getExpensesSumByDuration).toHaveBeenCalledTimes(1);
      expect(mockService.calculateSumByDuration).not.toHaveBeenCalled();
      expect(mockService.getIncomeSumByDuration).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors from getSummation', async () => {
      const error = new Error('Service error');
      mockService.calculateSumByDuration.mockRejectedValue(error);

      await expect(controller.getSummation()).rejects.toThrow('Service error');
    });

    it('should propagate service errors from getIncomeSummation', async () => {
      const error = new Error('Income calculation failed');
      mockService.getIncomeSumByDuration.mockRejectedValue(error);

      await expect(controller.getIncomeSummation()).rejects.toThrow(
        'Income calculation failed',
      );
    });

    it('should propagate service errors from getExpensesSummation', async () => {
      const error = new Error('Expense calculation failed');
      mockService.getExpensesSumByDuration.mockRejectedValue(error);

      await expect(controller.getExpensesSummation()).rejects.toThrow(
        'Expense calculation failed',
      );
    });
  });

  describe('Data-Driven Tests for Different GroupBy Values', () => {
    test.each([
      [GroupBy.DAY, 'day grouping'],
      [GroupBy.WEEK, 'week grouping'],
      [GroupBy.MONTH, 'month grouping'],
      [GroupBy.YEAR, 'year grouping'],
    ])('should handle %s for getSummation', async (groupBy) => {
      mockService.calculateSumByDuration.mockResolvedValue(mockResults);

      await controller.getSummation(groupBy);

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith(
        expect.objectContaining({ groupBy }),
      );
    });

    test.each([
      [Period.TODAY, 'today'],
      [Period.YESTERDAY, 'yesterday'],
      [Period.THIS_WEEK, 'this week'],
      [Period.LAST_WEEK, 'last week'],
      [Period.THIS_MONTH, 'this month'],
      [Period.LAST_MONTH, 'last month'],
      [Period.THIS_YEAR, 'this year'],
      [Period.LAST_YEAR, 'last year'],
    ])('should handle %s period for getSummation', async (period) => {
      mockService.calculateSumByDuration.mockResolvedValue(mockResults);

      await controller.getSummation(undefined, period);

      expect(mockService.calculateSumByDuration).toHaveBeenCalledWith(
        expect.objectContaining({ period }),
      );
    });
  });
});
