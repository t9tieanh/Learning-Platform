import { expect, test } from '@playwright/test'
import { getCredentials, hasCredentials, loginByApi } from '../helpers/auth.helper'

const openTeacherRoute = async (page: import('@playwright/test').Page, route: string) => {
  test.skip(!hasCredentials('instructor'), 'Set TEST_INSTRUCTOR_EMAIL and TEST_INSTRUCTOR_PASSWORD.')

  await loginByApi(page, getCredentials('instructor'))
  await page.goto(route, { waitUntil: 'commit' })
}

test.describe('teacher smoke', () => {
  test.describe.configure({ mode: 'serial' })

  test('loads teacher dashboard', async ({ page }) => {
    await openTeacherRoute(page, '/teacher')

    await expect(page).toHaveURL(/\/teacher\/?$/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads teacher courses page', async ({ page }) => {
    await openTeacherRoute(page, '/teacher/course')

    await expect(page).toHaveURL(/\/teacher\/course/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads teacher blogs page', async ({ page }) => {
    await openTeacherRoute(page, '/teacher/blogs')

    await expect(page).toHaveURL(/\/teacher\/blogs/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads teacher statistics page', async ({ page }) => {
    await openTeacherRoute(page, '/teacher/statistics')

    await expect(page).toHaveURL(/\/teacher\/statistics/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads teacher chat route without sending messages', async ({ page }) => {
    await openTeacherRoute(page, '/teacher/chat')

    await expect(page).toHaveURL(/\/teacher\/chat/)
    await expect(page.locator('main').first()).toBeVisible()
  })
})
