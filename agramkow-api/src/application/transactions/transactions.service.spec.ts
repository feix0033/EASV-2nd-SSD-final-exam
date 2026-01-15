import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionRepository } from '../../core/repositories/transaction-repository.interface';
import {
  Transaction,
  TransactionType,
} from '../../core/domain/transaction.model';

describe('TransactionsService - White-Box Testing', () => {
  let service: TransactionsService;
  let mockRepository: jest.Mocked<TransactionRepository>;

  const mockTransaction: Transaction = {
    id: '1',
    amount: 100,
    type: TransactionType.INCOME,
    date: new Date('2025-01-01'),
    description: 'Test transaction',
  };

  const mockTransactions: Transaction[] = [
    mockTransaction,
    {
      id: '2',
      amount: -50,
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-02'),
      description: 'Test expense',
    },
  ];

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn<Promise<void>, [Transaction]>(),
      findAll: jest.fn<Promise<Transaction[]>, []>(),
      findById: jest.fn<Promise<Transaction | null>, [string]>(),
      update: jest.fn<
        Promise<Transaction | null>,
        [string, Partial<Transaction>]
      >(),
      delete: jest.fn<Promise<boolean>, [string]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: 'TransactionRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add()', () => {
    it('should save transaction via repository', async () => {
      mockRepository.save.mockResolvedValue(undefined);

      const result = await service.add(mockTransaction);

      expect(result).toBeUndefined();
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTransaction);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.save.mockRejectedValue(error);

      await expect(service.add(mockTransaction)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll()', () => {
    it('should return all transactions', async () => {
      mockRepository.findAll.mockResolvedValue(mockTransactions);

      const result = await service.findAll();

      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when repository is empty', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database failure');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database failure');
    });
  });

  describe('findById()', () => {
    test.each([
      ['existing id', '1', mockTransaction],
      ['non-existent id', '999', null],
    ])('should handle %s', async (_, id, expected) => {
      mockRepository.findById.mockResolvedValue(expected);

      const result = await service.findById(id);

      expect(result).toEqual(expected);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Query failed');
      mockRepository.findById.mockRejectedValue(error);

      await expect(service.findById('1')).rejects.toThrow('Query failed');
    });
  });

  describe('update()', () => {
    const updateData: Partial<Transaction> = {
      amount: 200,
      description: 'Updated',
    };

    test.each([
      ['successful update', mockTransaction],
      ['transaction not found', null],
    ])('should handle %s', async (_, repositoryResult) => {
      mockRepository.update.mockResolvedValue(repositoryResult);

      const result = await service.update('1', updateData);

      expect(result).toEqual(repositoryResult);
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Update failed');
      mockRepository.update.mockRejectedValue(error);

      await expect(service.update('1', updateData)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('delete()', () => {
    test.each([
      ['deleted successfully', true],
      ['transaction not found', false],
    ])('should return %s', async (_, repositoryResult) => {
      mockRepository.delete.mockResolvedValue(repositoryResult);

      const result = await service.delete('1');

      expect(result).toBe(repositoryResult);
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Delete failed');
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.delete('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('Mock isolation', () => {
    it('should not call unrelated repository methods', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);

      await service.findById('1');

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
