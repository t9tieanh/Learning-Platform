import { expect, test } from '@playwright/test'
import { getCredentials, hasCredentials, loginByApi } from '../helpers/auth.helper'

const openAdminRoute = async (page: import('@playwright/test').Page, route: string) => {
  test.skip(!hasCredentials('admin'), 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD.')

  await loginByApi(page, getCredentials('admin'))
  await page.goto(route, { waitUntil: 'commit' })
}

test.describe('admin smoke', () => {
  test.describe.configure({ mode: 'serial' })

  test('loads admin dashboard', async ({ page }) => {
    await openAdminRoute(page, '/admin')

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads admin courses page', async ({ page }) => {
    await openAdminRoute(page, '/admin/courses')

    await expect(page).toHaveURL(/\/admin\/courses/)
    await expect(page.getByRole('textbox', { name: /Tìm theo tên khóa học/i })).toBeVisible()
  })

  test('loads admin instructors page', async ({ page }) => {
    await openAdminRoute(page, '/admin/instructors')

    await expect(page).toHaveURL(/\/admin\/instructors/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads admin certificates page', async ({ page }) => {
    await openAdminRoute(page, '/admin/certificates')

    await expect(page).toHaveURL(/\/admin\/certificates/)
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('loads admin blogs page', async ({ page }) => {
    await openAdminRoute(page, '/admin/blogs')

    await expect(page).toHaveURL(/\/admin\/blogs/)
    await expect(page.locator('main').first()).toBeVisible()
  })
})
