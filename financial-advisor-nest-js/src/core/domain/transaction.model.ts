export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: Date;
  description?: string;
}
