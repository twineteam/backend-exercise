/**
 * Analytics Service Tests
 *
 * Tests verify expected behavior.
 */

import { AnalyticsService } from './analytics.service';
import { Employee } from '../employees/employee.entity';

// Mock CacheService - always returns null (cache miss) for testing
class MockCacheService {
  async get(): Promise<null> {
    return null;
  }

  async set(): Promise<void> {
    // no-op
  }

  async del(): Promise<void> {
    // no-op
  }

  generateKey(...parts: (string | undefined | null)[]): string {
    return parts.filter(Boolean).join(':');
  }
}

// Mock EmployeesService
class MockEmployeesService {
  private employees: Employee[] = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@test.com',
      department: 'Engineering',
      salary: 100000,
      hireDate: new Date('2025-06-04'),
      title: 'Engineer',
    },
    {
      id: '2',
      name: 'Eva',
      email: 'eva@test.com',
      department: 'Engineering',
      salary: 110000,
      hireDate: new Date('2025-06-05'),
      title: 'Engineer',
    },
    {
      id: '3',
      name: 'Bob',
      email: 'bob@test.com',
      department: 'Engineering',
      salary: 120000,
      hireDate: new Date('2025-06-06'),
      title: 'Engineer',
    },
  ];

  async findAll(): Promise<Employee[]> {
    return this.employees;
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return this.employees.filter((emp) => emp.department === department);
  }

  async getDepartments(): Promise<string[]> {
    return ['Engineering'];
  }
}

// Mock for empty department test
class MockEmptyEmployeesService {
  async findAll(): Promise<Employee[]> {
    return [];
  }

  async findByDepartment(): Promise<Employee[]> {
    return [];
  }

  async getDepartments(): Promise<string[]> {
    return ['Engineering'];
  }
}

describe('AnalyticsService', () => {
  const mockCacheService = new MockCacheService();

  describe('Basic Functionality', () => {
    it('should return metrics for a department', async () => {
      const mockService = new MockEmployeesService();
      const analyticsService = new AnalyticsService(
        mockService as never,
        mockCacheService as never,
      );

      const result = await analyticsService.getDepartmentMetrics(
        undefined,
        undefined,
        'Engineering',
      );

      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].department).toBe('Engineering');
      expect(result.metrics[0].employeeCount).toBe(3);
    });

    it('should calculate average salary correctly', async () => {
      const mockService = new MockEmployeesService();
      const analyticsService = new AnalyticsService(
        mockService as never,
        mockCacheService as never,
      );

      const result = await analyticsService.getDepartmentMetrics(
        undefined,
        undefined,
        'Engineering',
      );

      // Average of 100000, 110000, 120000 = 110000
      expect(result.metrics[0].averageSalary).toBe(110000);
    });

    it('should apply date filters correctly', async () => {
      const mockService = new MockEmployeesService();
      const analyticsService = new AnalyticsService(
        mockService as never,
        mockCacheService as never,
      );

      const result = await analyticsService.getDepartmentMetrics(
        '2025-06-05',
        '2025-06-07', // Day after Bob's hire date to avoid boundary issue
        'Engineering',
      );

      // Eva (06-05) and Bob (06-06) should be included
      expect(result.totalEmployees).toBe(2);
    });
  });

  describe('Empty Department Handling', () => {
    it('should return valid numbers for empty departments', async () => {
      const mockService = new MockEmptyEmployeesService();
      const analyticsService = new AnalyticsService(
        mockService as never,
        mockCacheService as never,
      );

      const result = await analyticsService.getDepartmentMetrics(
        undefined,
        undefined,
        'Engineering',
      );

      expect(Number.isNaN(result.metrics[0].averageSalary)).toBe(false);
      expect(Number.isNaN(result.metrics[0].averageTenureDays)).toBe(false);
    });

    it('should return 0 for average salary when department is empty', async () => {
      const mockService = new MockEmptyEmployeesService();
      const analyticsService = new AnalyticsService(
        mockService as never,
        mockCacheService as never,
      );

      const result = await analyticsService.getDepartmentMetrics(
        undefined,
        undefined,
        'Engineering',
      );

      expect(result.metrics[0].averageSalary).toBe(0);
      expect(result.metrics[0].averageTenureDays).toBe(0);
    });
  });
});
