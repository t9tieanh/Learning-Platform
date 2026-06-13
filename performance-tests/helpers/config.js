import { SharedArray } from 'k6/data';

const DEFAULT_BASE_URL = 'https://api-learnova.t9tieanh.io.vn/api/v1/';
const DEFAULT_WEB_URL = 'https://learnova.t9tieanh.io.vn/';
const DEFAULT_TIMEOUT = __ENV.HTTP_TIMEOUT || '30s';

function loadJson(relativePath) {
  return new SharedArray(relativePath, () => JSON.parse(open(relativePath)));
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function normalizeBaseUrl(value, fallback) {
  return (value || fallback).replace(/\/+$/, '');
}

export const BASE_URL = normalizeBaseUrl(__ENV.BASE_URL, DEFAULT_BASE_URL);
export const WEB_URL = normalizeBaseUrl(__ENV.WEB_URL, DEFAULT_WEB_URL);
export const HTTP_TIMEOUT = DEFAULT_TIMEOUT;

export const users = loadJson('../data/users.sample.json');
export const admins = loadJson('../data/admins.sample.json');
export const instructors = loadJson('../data/instructors.sample.json');
export const courses = loadJson('../data/courses.sample.json');

export const credentials = {
  user: {
    login: firstDefined(__ENV.USER_LOGIN, __ENV.USER_USERNAME, __ENV.USER_EMAIL, users[0]?.login, users[0]?.email),
    password: firstDefined(__ENV.USER_PASSWORD, users[0]?.password),
    token: firstDefined(__ENV.USER_TOKEN),
  },
  admin: {
    login: firstDefined(__ENV.ADMIN_LOGIN, __ENV.ADMIN_USERNAME, __ENV.ADMIN_EMAIL, admins[0]?.login, admins[0]?.email),
    password: firstDefined(__ENV.ADMIN_PASSWORD, admins[0]?.password),
    token: firstDefined(__ENV.ADMIN_TOKEN),
  },
  instructor: {
    login: firstDefined(
      __ENV.INSTRUCTOR_LOGIN,
      __ENV.INSTRUCTOR_USERNAME,
      __ENV.INSTRUCTOR_EMAIL,
      instructors[0]?.login,
      instructors[0]?.email,
    ),
    password: firstDefined(__ENV.INSTRUCTOR_PASSWORD, instructors[0]?.password),
    token: firstDefined(__ENV.INSTRUCTOR_TOKEN),
  },
};

export const defaultCourseId = firstDefined(__ENV.COURSE_ID, courses[0]?.id);
export const defaultSearchKeywords = [
  'react',
  'java',
  'spring',
  'node',
  'english',
  'design',
];

export const flags = {
  enableWriteFlows: __ENV.ENABLE_WRITE_FLOWS === 'true',
  enableSandboxOrderFlow: __ENV.ENABLE_SANDBOX_ORDER_FLOW === 'true',
  enableBrowserLogin: __ENV.ENABLE_BROWSER_LOGIN === 'true',
};

export const knownPaths = {
  authLogin: '/auth',
  selfProfile: '/self',
  saleStatus: '/sale/status',
  saleHealth: '/sale/health',
  courseList: '/learning/courses',
  courseDetail: '/learning/courses',
  myLearning: '/learning/courses-student/self',
  cart: '/sale/cart',
  order: '/sale/orders',
  adminHome: '/user/home-admin',
  adminBusinessPerformance: '/learning/admin/business-performance',
  instructorStatistic: '/instructor/statistic',
  instructorChart: '/instructor/chart',
};

export function buildUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function hasCredential(role) {
  const item = credentials[role];
  return Boolean(item?.login && item?.password);
}

export function isTokenConfigured(role) {
  return Boolean(credentials[role]?.token);
}

export function getTimeout(overrides = {}) {
  return overrides.timeout || HTTP_TIMEOUT;
}
