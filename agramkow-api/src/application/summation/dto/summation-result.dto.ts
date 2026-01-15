export class SummationResultDto {
  period: string; // e.g., "2024-W01", "2024-01", "2024-01-01"
  total: number;
  count: number;
  startDate: Date;
  endDate: Date;
}
