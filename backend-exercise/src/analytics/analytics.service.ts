import { Injectable } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { Employee } from '../employees/employee.entity';
import { DepartmentMetricsDto, AnalyticsResponseDto } from './dto/analytics.dto';
import { CacheService } from '../cache/cache.service';

const CACHE_PREFIX = 'analytics:department-metrics';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly cacheService: CacheService,
  ) {}

  async getDepartmentMetrics(
    startDate?: string,
    endDate?: string,
    department?: string,
  ): Promise<AnalyticsResponseDto> {
    // Check cache first
    const cacheKey = this.cacheService.generateKey(
      CACHE_PREFIX,
      startDate,
      endDate,
      department,
    );

    const cached = await this.cacheService.get<AnalyticsResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all employees first
    const allEmployees = await this.employeesService.findAll();

    // Apply date filters
    const filteredEmployees = this.applyDateFilters(
      allEmployees,
      startDate,
      endDate,
    );

    // Get departments to process
    const departmentsToProcess = department
      ? [department]
      : await this.employeesService.getDepartments();

    const metrics: DepartmentMetricsDto[] = [];

    for (const dept of departmentsToProcess) {
      const deptEmployees = await this.employeesService.findByDepartment(dept);
      const deptFiltered = this.applyDateFilters(deptEmployees, startDate, endDate);
      const deptMetrics = this.calculateDepartmentMetrics(deptFiltered, dept);
      metrics.push(deptMetrics);
    }

    const result: AnalyticsResponseDto = {
      metrics,
      totalEmployees: filteredEmployees.length,
      filtersApplied: {
        startDate: startDate || null,
        endDate: endDate || null,
        department: department || null,
      },
    };

    // Cache the result
    await this.cacheService.set(cacheKey, result);

    return result;
  }

  private applyDateFilters(
    employees: Employee[],
    startDate?: string,
    endDate?: string,
  ): Employee[] {
    let filtered = employees;

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((emp) => emp.hireDate >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((emp) => emp.hireDate < end);
    }

    return filtered;
  }

  private calculateDepartmentMetrics(
    employees: Employee[],
    department: string,
  ): DepartmentMetricsDto {
    const deptEmployees = employees.filter(
      (emp) => emp.department === department,
    );

    const employeeCount = deptEmployees.length;

    if (employeeCount === 0) {
      return {
        department,
        employeeCount: 0,
        averageSalary: 0,
        averageTenureDays: 0,
      };
    }

    const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);

    const today = new Date();
    const totalTenureDays = deptEmployees.reduce((sum, emp) => {
      const tenureDays = Math.floor(
        (today.getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return sum + tenureDays;
    }, 0);

    const averageSalary = totalSalary / employeeCount;
    const averageTenure = totalTenureDays / employeeCount;

    return {
      department,
      employeeCount,
      averageSalary: Math.round(averageSalary * 100) / 100,
      averageTenureDays: Math.round(averageTenure * 10) / 10,
    };
  }
}
