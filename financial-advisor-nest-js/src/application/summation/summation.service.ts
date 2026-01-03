import { Injectable, Inject } from '@nestjs/common';
import { ISummationRepository, ISummationTransaction } from '../../core';
import { SummationQueryDto } from './dto/summation-query.dto';
import { SummationResultDto } from './dto/summation-result.dto';
import { GroupBy } from './enums/group-by.enum';
import { Period } from './enums/period.enum';

@Injectable()
export class SummationService {
  constructor(
    @Inject('ISummationRepository')
    private readonly repository: ISummationRepository,
  ) {}

  /**
   * Calculate sum of amounts grouped by the specified period
   */
  async calculateSumByDuration(
    query: SummationQueryDto,
  ): Promise<SummationResultDto[]> {
    const dateRange = this.getDateRange(query);
    const transactions = await this.repository.findByDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );

    const groupBy = query.groupBy || GroupBy.MONTH;
    return this.groupAndSum(transactions, groupBy);
  }

  /**
   * Calculate sum of income (positive values) grouped by period
   */
  async getIncomeSumByDuration(
    query: SummationQueryDto,
  ): Promise<SummationResultDto[]> {
    const dateRange = this.getDateRange(query);
    const transactions = await this.repository.findByDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );

    const incomeTransactions = transactions.filter(
      (transaction) => transaction.amount > 0,
    );
    const groupBy = query.groupBy || GroupBy.MONTH;
    return this.groupAndSum(incomeTransactions, groupBy);
  }

  /**
   * Calculate sum of expenses (negative values) grouped by period
   */
  async getExpensesSumByDuration(
    query: SummationQueryDto,
  ): Promise<SummationResultDto[]> {
    const dateRange = this.getDateRange(query);
    const transactions = await this.repository.findByDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.amount < 0,
    );
    const groupBy = query.groupBy || GroupBy.MONTH;
    return this.groupAndSum(expenseTransactions, groupBy);
  }

  /**
   * Group transactions by period and calculate totals
   */
  private groupAndSum(
    transactions: ISummationTransaction[],
    groupBy: GroupBy,
  ): SummationResultDto[] {
    const grouped = new Map<string, ISummationTransaction[]>();

    transactions.forEach((transaction) => {
      const key = this.getPeriodKey(transaction.date, groupBy);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(transaction);
    });

    return Array.from(grouped.entries()).map(([period, periodTransactions]) => {
      const dates = periodTransactions.map((t) => t.date);
      return {
        period,
        total: periodTransactions.reduce((sum, t) => sum + t.amount, 0),
        count: periodTransactions.length,
        startDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
        endDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
      };
    });
  }

  /**
   * Generate period key based on groupBy type
   */
  private getPeriodKey(date: Date, groupBy: GroupBy): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (groupBy) {
      case GroupBy.DAY:
        return `${year}-${month}-${day}`;

      case GroupBy.WEEK: {
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${String(weekNumber).padStart(2, '0')}`;
      }

      case GroupBy.MONTH:
        return `${year}-${month}`;

      case GroupBy.YEAR:
        return `${year}`;

      default:
        throw new Error('Unsupported groupBy value');
    }
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get date range from query (supports period presets)
   */
  private getDateRange(query: SummationQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    if (query.period) {
      return this.getPeriodDateRange(query.period);
    }

    return {
      startDate: query.startDate || new Date(0),
      endDate: query.endDate || new Date(),
    };
  }

  /**
   * Convert period preset to date range
   */
  private getPeriodDateRange(period: Period): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    switch (period) {
      case Period.TODAY: {
        return {
          startDate: new Date(today),
          endDate,
        };
      }

      case Period.YESTERDAY: {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return {
          startDate: yesterday,
          endDate: yesterdayEnd,
        };
      }

      case Period.THIS_WEEK: {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(
          today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
        );
        return {
          startDate: startOfWeek,
          endDate,
        };
      }

      case Period.LAST_WEEK: {
        const dayOfWeek = today.getDay();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - dayOfWeek - 6);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return {
          startDate: startOfLastWeek,
          endDate: endOfLastWeek,
        };
      }

      case Period.THIS_MONTH: {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth,
          endDate,
        };
      }

      case Period.LAST_MONTH: {
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
        );
        endOfLastMonth.setHours(23, 59, 59, 999);
        return {
          startDate: startOfLastMonth,
          endDate: endOfLastMonth,
        };
      }

      case Period.THIS_YEAR: {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          startDate: startOfYear,
          endDate,
        };
      }

      case Period.LAST_YEAR: {
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        endOfLastYear.setHours(23, 59, 59, 999);
        return {
          startDate: startOfLastYear,
          endDate: endOfLastYear,
        };
      }

      default:
        throw new Error('Unsupported period value');
    }
  }
}
