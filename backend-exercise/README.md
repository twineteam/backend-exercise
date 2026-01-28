# Backend Exercise: Analytics API

A NestJS analytics service for employee data. This is a production codebase with Redis caching.

## Setup

```bash
cd backend-exercise
pnpm install
pnpm run start:dev
```

API docs available at http://localhost:3000/api

## Project Structure

```
src/
├── analytics/          # Analytics endpoints and business logic
├── employees/          # Employee data and CRUD operations
├── cache/              # Redis caching layer
└── main.ts             # Application entry point

logs/                   # Production log files
docs/                   # Customer and system documentation
```

## The API

### GET /analytics/department-metrics

Returns aggregated metrics by department:
- Employee count
- Average salary
- Average tenure (days)

**Query params:**
- `startDate` (optional): Filter employees hired on or after this date (YYYY-MM-DD)
- `endDate` (optional): Filter employees hired on or before this date (YYYY-MM-DD)
- `department` (optional): Filter to specific department

### GET /employees

Returns all employees.

### GET /employees/:id

Returns a specific employee.

### PUT /employees/:id

Updates an employee's data.

## Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Sample Requests

```bash
# Get all department metrics
curl "http://localhost:3000/analytics/department-metrics" | jq

# Filter by date range
curl "http://localhost:3000/analytics/department-metrics?startDate=2024-01-01&endDate=2025-01-01" | jq

# Filter by department
curl "http://localhost:3000/analytics/department-metrics?department=Engineering" | jq

# Get an employee
curl "http://localhost:3000/employees/1" | jq

# Update an employee
curl -X PUT "http://localhost:3000/employees/1" \
  -H "Content-Type: application/json" \
  -d '{"salary": 150000}'
```
