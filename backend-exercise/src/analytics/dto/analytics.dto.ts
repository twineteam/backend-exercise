import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class GetMetricsQueryDto {
  @ApiPropertyOptional({ description: 'Filter employees hired on or after this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter employees hired on or before this date', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter to specific department', example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;
}

export class DepartmentMetricsDto {
  @ApiProperty()
  department: string;

  @ApiProperty()
  employeeCount: number;

  @ApiProperty()
  averageSalary: number;

  @ApiProperty()
  averageTenureDays: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({ type: [DepartmentMetricsDto] })
  metrics: DepartmentMetricsDto[];

  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  filtersApplied: {
    startDate: string | null;
    endDate: string | null;
    department: string | null;
  };
}
