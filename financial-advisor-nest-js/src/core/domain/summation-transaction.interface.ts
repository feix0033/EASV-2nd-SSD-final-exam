/**
 * Interface for a financial transaction that can be summed
 * Todo: Create the actual entity/model implementing this interface
 */
export interface ISummationTransaction {
  amount: number;
  date: Date;
  // Add other fields as needed, but the service only needs these two
}
