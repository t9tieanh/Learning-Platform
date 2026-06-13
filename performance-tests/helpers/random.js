import { courses, defaultCourseId, defaultSearchKeywords, users } from './config.js'

function randomItem(items, fallback = null) {
  if (!items || items.length === 0) {
    return fallback
  }
  return items[Math.floor(Math.random() * items.length)]
}

export function randomKeyword() {
  const fromCourses = courses
    .map((course) => course.searchKeyword || course.title || '')
    .filter(Boolean)
  return randomItem(fromCourses.length ? fromCourses : defaultSearchKeywords, defaultSearchKeywords[0])
}

export function randomUser() {
  return randomItem(users, users[0] || null)
}

export function randomCourse() {
  return randomItem(courses, courses[0] || null)
}

export function randomCourseId() {
  return randomCourse()?.id || defaultCourseId || null
}

export function randomPage(max = 3) {
  return Math.max(1, Math.floor(Math.random() * max) + 1)
}

export function randomLimit(min = 4, max = 12) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
