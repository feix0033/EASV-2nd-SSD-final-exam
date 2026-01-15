import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  Transaction,
  TransactionType,
} from '../../core/domain/transaction.model';

describe('TransactionsController - White-Box Testing', () => {
  let controller: TransactionsController;

  let mockService: {
    add: jest.Mock<Promise<void>, [Transaction]>;
    findAll: jest.Mock<Promise<Transaction[]>, []>;
    findById: jest.Mock<Promise<Transaction | null>, [string]>;
    update: jest.Mock<
      Promise<Transaction | null>,
      [string, Partial<Transaction>]
    >;
    delete: jest.Mock<Promise<boolean>, [string]>;
  };

  const mockTransaction: Transaction = {
    id: '1',
    amount: 100,
    type: TransactionType.INCOME,
    date: new Date('2025-01-01T00:00:00.000Z'),
    description: 'Test transaction',
  };

  const mockTransactions: Transaction[] = [
    mockTransaction,
    {
      id: '2',
      amount: -50,
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-02T00:00:00.000Z'),
      description: 'Test expense',
    },
  ];

  beforeEach(async () => {
    mockService = {
      add: jest.fn<Promise<void>, [Transaction]>(),
      findAll: jest.fn<Promise<Transaction[]>, []>(),
      findById: jest.fn<Promise<Transaction | null>, [string]>(),
      update: jest.fn<
        Promise<Transaction | null>,
        [string, Partial<Transaction>]
      >(),
      delete: jest.fn<Promise<boolean>, [string]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(TransactionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    const baseDto: CreateTransactionDto = {
      amount: 100,
      type: TransactionType.INCOME,
      date: '2025-01-01',
      description: 'Test',
    };

    it('should create and return a transaction', async () => {
      mockService.add.mockResolvedValue(undefined);

      const result = await controller.create(baseDto);

      expect(result.amount).toBe(baseDto.amount);
      expect(result.type).toBe(baseDto.type);
      expect(result.description).toBe(baseDto.description);
      expect(typeof result.date).toBe('string');
      expect(result.id).toBeDefined();
    });

    it('should pass Date object to service', async () => {
      mockService.add.mockResolvedValue(undefined);

      await controller.create(baseDto);

      const [createdTransaction] = mockService.add.mock.calls[0];

      expect(createdTransaction).toHaveProperty('date');
      expect(createdTransaction.date).toBeInstanceOf(Date);
    });

    test.each([
      {
        description: 'income',
        dto: {
          amount: 1000,
          type: TransactionType.INCOME,
          date: '2025-01-01',
        },
      },
      {
        description: 'expense',
        dto: {
          amount: -50,
          type: TransactionType.EXPENSE,
          date: '2025-01-02',
        },
      },
      {
        description: 'zero amount',
        dto: {
          amount: 0,
          type: TransactionType.EXPENSE,
          date: '2025-01-03',
        },
      },
    ])('should handle $description transaction', async ({ dto }) => {
      mockService.add.mockResolvedValue(undefined);

      const result = await controller.create(dto);

      expect(result.amount).toBe(dto.amount);
      expect(result.type).toBe(dto.type);
    });
  });

  describe('findAll()', () => {
    it('should return all transactions', async () => {
      mockService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(typeof result[0].date).toBe('string');
    });

    it('should return empty array when no transactions exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return transaction when found', async () => {
      mockService.findById.mockResolvedValue(mockTransaction);

      const result = await controller.findOne('1');

      expect(result.id).toBe('1');
      expect(result.amount).toBe(100);
    });

    it('should throw NotFoundException when not found', async () => {
      mockService.findById.mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    const updateDto: UpdateTransactionDto = {
      amount: 200,
      description: 'Updated',
    };

    it('should update and return transaction', async () => {
      mockService.update.mockResolvedValue({
        ...mockTransaction,
        amount: 200,
        description: 'Updated',
      });

      const result = await controller.update('1', updateDto);

      expect(result.amount).toBe(200);
      expect(result.description).toBe('Updated');
    });

    it('should convert date string to Date when provided', async () => {
      const dtoWithDate: UpdateTransactionDto = {
        date: '2025-02-01',
      };

      mockService.update.mockResolvedValue(mockTransaction);

      await controller.update('1', dtoWithDate);

      const [, updateArg] = mockService.update.mock.calls[0];

      expect(updateArg).toHaveProperty('date');
      expect(updateArg?.date).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockService.update.mockResolvedValue(null);

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete transaction successfully', async () => {
      mockService.delete.mockResolvedValue(true);

      await expect(controller.remove('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockService.delete.mockResolvedValue(false);

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Service error propagation', () => {
    test.each([
      [
        'create',
        () =>
          controller.create({
            amount: 1,
            type: TransactionType.INCOME,
            date: '2025-01-01',
          }),
      ],
      ['findAll', () => controller.findAll()],
      ['findOne', () => controller.findOne('1')],
      ['update', () => controller.update('1', { amount: 1 })],
      ['remove', () => controller.remove('1')],
    ])('should propagate error in %s()', async (_, action) => {
      const error = new Error('Database error');

      mockService.add.mockRejectedValue(error);
      mockService.findAll.mockRejectedValue(error);
      mockService.findById.mockRejectedValue(error);
      mockService.update.mockRejectedValue(error);
      mockService.delete.mockRejectedValue(error);

      await expect(action()).rejects.toThrow('Database error');
    });
  });
});
