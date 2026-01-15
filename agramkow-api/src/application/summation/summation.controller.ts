import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SummationService } from './summation.service';
import { GroupBy } from './enums/group-by.enum';
import { Period } from './enums/period.enum';
import { SummationResultDto } from './dto/summation-result.dto';

@ApiTags('Summation')
@Controller('summation')
export class SummationController {
  constructor(private readonly summationService: SummationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get total summation',
    description:
      'Calculate sum of all transactions grouped by period. ' +
      'Use period for relative ranges (e.g., "yesterday") OR ' +
      'use startDate/endDate for specific ranges.',
  })
  @ApiQuery({
    name: 'groupBy',
    enum: GroupBy,
    required: false,
    example: 'month',
  })
  @ApiQuery({
    name: 'period',
    enum: Period,
    required: false,
    example: 'thismonth',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of summation results',
    type: [SummationResultDto],
  })
  async getSummation(
    @Query('groupBy') groupBy?: GroupBy,
    @Query('period') period?: Period,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.summationService.calculateSumByDuration({
      groupBy,
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('income')
  @ApiOperation({
    summary: 'Get income summation',
    description:
      'Calculate sum of positive values (income) grouped by period. ' +
      'Use period for relative ranges OR startDate/endDate for specific ranges.',
  })
  @ApiQuery({
    name: 'groupBy',
    enum: GroupBy,
    required: false,
    example: 'month',
  })
  @ApiQuery({
    name: 'period',
    enum: Period,
    required: false,
    example: 'thismonth',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of income summation results',
    type: [SummationResultDto],
  })
  async getIncomeSummation(
    @Query('groupBy') groupBy?: GroupBy,
    @Query('period') period?: Period,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.summationService.getIncomeSumByDuration({
      groupBy,
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('expenses')
  @ApiOperation({
    summary: 'Get expenses summation',
    description:
      'Calculate sum of negative values (expenses) grouped by period. ' +
      'Use period for relative ranges OR startDate/endDate for specific ranges.',
  })
  @ApiQuery({
    name: 'groupBy',
    enum: GroupBy,
    required: false,
    example: 'month',
  })
  @ApiQuery({
    name: 'period',
    enum: Period,
    required: false,
    example: 'thismonth',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of expense summation results',
    type: [SummationResultDto],
  })
  async getExpensesSummation(
    @Query('groupBy') groupBy?: GroupBy,
    @Query('period') period?: Period,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.summationService.getExpensesSumByDuration({
      groupBy,
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
