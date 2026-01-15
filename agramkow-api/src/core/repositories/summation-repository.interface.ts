import { ISummationTransaction } from '../domain/summation-transaction.interface';

/**
 * Repository interface for data access
 * Todo: Implement this to connect to the actual data source
 */
export interface ISummationRepository {
  /**
   * Find all transactions within a date range
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Promise of transactions matching the criteria
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ISummationTransaction[]>;

  /**
   * Find all transactions (optional - for getting all data)
   */
  findAll(): Promise<ISummationTransaction[]>;
}
