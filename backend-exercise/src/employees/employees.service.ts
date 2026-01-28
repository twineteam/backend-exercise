import { Injectable } from '@nestjs/common';
import { Employee, MOCK_EMPLOYEES } from './employee.entity';

// Helper to simulate async database latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mutable copy of employees for updates
let employees = [...MOCK_EMPLOYEES];

@Injectable()
export class EmployeesService {
  async findAll(): Promise<Employee[]> {
    await delay(100); // Simulate DB latency
    return employees;
  }

  async findById(id: string): Promise<Employee | undefined> {
    await delay(50);
    return employees.find((emp) => emp.id === id);
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    await delay(50); // Simulate DB latency per department query
    return employees.filter((emp) => emp.department === department);
  }

  async getDepartments(): Promise<string[]> {
    await delay(50);
    return [...new Set(employees.map((emp) => emp.department))];
  }

  async update(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    await delay(50);

    const index = employees.findIndex((emp) => emp.id === id);
    if (index === -1) {
      return null;
    }

    // Update the employee
    employees[index] = { ...employees[index], ...updates };

    // BUG: No cache invalidation here!
    // The analytics cache will serve stale data until TTL expires

    return employees[index];
  }

  // Reset to original data (useful for testing)
  resetData(): void {
    employees = [...MOCK_EMPLOYEES];
  }
}
