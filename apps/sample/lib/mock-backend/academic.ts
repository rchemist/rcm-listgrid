// `college` / `professor` / `university` entity fixtures — extends the P1
// employee-only mock backend with a small academic domain for exercising
// multi-entity list/form flows (ManyToOne-shaped relations across the three
// entities land with the entity pages that consume them; this module only
// owns the fixture data + stores).

import { getOrCreateStore } from './store';

export interface College {
  id: string;
  name: string;
  englishName: string;
  description: string;
  active: boolean;
  [key: string]: unknown;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface University {
  id: string;
  name: string;
  [key: string]: unknown;
}

const collegeSeed: College[] = [
  {
    id: '1',
    name: '공과대학',
    englishName: 'College of Engineering',
    description: '전자, 기계, 컴퓨터공학 등 공학 계열 학과를 운영합니다.',
    active: true,
  },
  {
    id: '2',
    name: '인문대학',
    englishName: 'College of Humanities',
    description: '국어국문학, 사학, 철학 등 인문학 계열 학과를 운영합니다.',
    active: true,
  },
  {
    id: '3',
    name: '자연과학대학',
    englishName: 'College of Natural Sciences',
    description: '수학, 물리학, 화학, 생명과학 등 기초과학 계열 학과를 운영합니다.',
    active: true,
  },
  {
    id: '4',
    name: '경영대학',
    englishName: 'College of Business Administration',
    description: '경영학, 회계학, 국제통상학 등 경영 계열 학과를 운영합니다.',
    active: true,
  },
  {
    id: '5',
    name: '사회과학대학',
    englishName: 'College of Social Sciences',
    description: '정치외교학, 사회학, 심리학 등 사회과학 계열 학과를 운영합니다.',
    active: false,
  },
  {
    id: '6',
    name: '의과대학',
    englishName: 'College of Medicine',
    description: '의예과, 의학과 등 의학 계열 학과를 운영합니다.',
    active: true,
  },
];

const professorSeed: Professor[] = [
  { id: '1', name: '김태윤', email: 'taeyoon.kim@example.ac.kr' },
  { id: '2', name: '이하은', email: 'haeun.lee@example.ac.kr' },
  { id: '3', name: '박성민', email: 'seongmin.park@example.ac.kr' },
  { id: '4', name: '최지우', email: 'jiwoo.choi@example.ac.kr' },
  { id: '5', name: '정우진', email: 'woojin.jung@example.ac.kr' },
  { id: '6', name: '강나윤', email: 'nayoon.kang@example.ac.kr' },
  { id: '7', name: '조현우', email: 'hyunwoo.jo@example.ac.kr' },
  { id: '8', name: '윤소율', email: 'soyul.yoon@example.ac.kr' },
];

const universitySeed: University[] = [
  { id: '1', name: '서울대학교' },
  { id: '2', name: '연세대학교' },
  { id: '3', name: '고려대학교' },
  { id: '4', name: '한양대학교' },
];

export function collegeStore() {
  return getOrCreateStore<College>('college', collegeSeed);
}

export function professorStore() {
  return getOrCreateStore<Professor>('professor', professorSeed);
}

export function universityStore() {
  return getOrCreateStore<University>('university', universitySeed);
}
