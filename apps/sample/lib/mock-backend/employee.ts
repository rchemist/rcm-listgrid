// `employee` entity fixture — the one entity P1 needs wired end-to-end
// (documents/prd/sample-site-spec.md §페이즈별 성장 — P1 = 스캐폴드).
// Full field diversity (select/multiselect/M2O/etc.) lands with the
// Employee entity page in P5; P1 keeps the shape minimal.

import { getOrCreateStore } from './store';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  hireDate: string;
  [key: string]: unknown;
}

const seed: Employee[] = [
  {
    id: '1',
    name: '김도윤',
    email: 'doyoon.kim@example.com',
    department: 'Engineering',
    status: 'ACTIVE',
    hireDate: '2021-03-02',
  },
  {
    id: '2',
    name: '이서연',
    email: 'seoyeon.lee@example.com',
    department: 'Product',
    status: 'ACTIVE',
    hireDate: '2022-07-18',
  },
  {
    id: '3',
    name: '박지훈',
    email: 'jihoon.park@example.com',
    department: 'Engineering',
    status: 'ON_LEAVE',
    hireDate: '2020-11-09',
  },
  {
    id: '4',
    name: '최유나',
    email: 'yuna.choi@example.com',
    department: 'Design',
    status: 'ACTIVE',
    hireDate: '2023-01-23',
  },
  {
    id: '5',
    name: '정민재',
    email: 'minjae.jung@example.com',
    department: 'Sales',
    status: 'RESIGNED',
    hireDate: '2019-05-14',
  },
];

export function employeeStore() {
  return getOrCreateStore<Employee>('employee', seed);
}
