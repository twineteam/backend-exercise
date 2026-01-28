export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  hireDate: Date;
  salary: number;
  title: string;
}

// Generate realistic department names
const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Legal',
  'Operations',
  'Customer Success',
  'Data Science',
  'DevOps',
  'QA',
  'Security',
  'IT Support',
  'Business Development',
  'Research',
  'Analytics',
  'Content',
  'Partnerships',
  'Recruiting',
  'Facilities',
  'Procurement',
  'Compliance',
  'Risk Management',
  'Internal Audit',
  'Treasury',
  'Investor Relations',
  'Corporate Strategy',
  'M&A',
  'Platform Engineering',
  'Mobile Engineering',
  'Frontend Engineering',
  'Backend Engineering',
  'Infrastructure',
  'Site Reliability',
  'Machine Learning',
  'AI Research',
  'Product Design',
  'UX Research',
  'Brand Design',
  'Growth Marketing',
  'Performance Marketing',
  'Product Marketing',
  'Enterprise Sales',
  'SMB Sales',
  'Sales Operations',
  'Revenue Operations',
  'Customer Support',
  'Technical Support',
];

// First names and last names for generating employees
const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tina',
  'Uma', 'Victor', 'Wendy', 'Xavier', 'Yuki', 'Zoe', 'Adam', 'Bella', 'Chris', 'Diana',
];

const LAST_NAMES = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Martinez', 'Lee', 'Kim', 'Chen', 'Patel', 'Wilson',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Robinson', 'Clark',
];

const TITLES = [
  'Junior', 'Associate', 'Senior', 'Staff', 'Principal', 'Director', 'VP', 'Manager', 'Lead', 'Specialist',
];

// Generate a deterministic employee based on index
function generateEmployee(index: number): Employee {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const department = DEPARTMENTS[index % DEPARTMENTS.length];
  const title = TITLES[index % TITLES.length];

  // Generate hire date spread across 2024-2026
  const baseDate = new Date('2024-01-01');
  const daysToAdd = (index * 17) % 730; // Spread across ~2 years
  const hireDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  // Generate salary between 60k-180k based on title
  const baseSalary = 60000 + (index % 10) * 12000;

  return {
    id: String(index + 1),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@company.com`,
    department,
    hireDate,
    salary: baseSalary,
    title: `${title} ${department.split(' ')[0]}`,
  };
}

// Generate 150 employees across 50 departments (~3 per department on average)
// This creates realistic data where N+1 queries become noticeable
export const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 150 }, (_, i) => generateEmployee(i));
