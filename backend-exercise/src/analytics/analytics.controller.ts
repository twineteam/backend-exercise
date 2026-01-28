import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GetMetricsQueryDto, AnalyticsResponseDto } from './dto/analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('department-metrics')
  @ApiOperation({ summary: 'Get aggregated metrics by department' })
  @ApiResponse({
    status: 200,
    description: 'Returns employee count, average salary, and average tenure for each department',
    type: AnalyticsResponseDto,
  })
  async getDepartmentMetrics(
    @Query() query: GetMetricsQueryDto,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getDepartmentMetrics(
      query.startDate,
      query.endDate,
      query.department,
    );
  }
}
