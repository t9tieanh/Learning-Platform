import { expect, test } from '@playwright/test'
import { getPersistedAccessToken, getStudentCredentials, hasStudentCredentials, login } from '../helpers/auth.helper'

test.describe.configure({ mode: 'serial' })

const loginEmailInput = (page: import('@playwright/test').Page) =>
  page.locator('input[placeholder*="Tên đăng nhập"]:visible').first()

const loginPasswordInput = (page: import('@playwright/test').Page) =>
  page.locator('input[type="password"]:visible').first()

const signUpInput = (page: import('@playwright/test').Page, index: number) => page.locator('input:visible').nth(index)

const openAuthPage = async (page: import('@playwright/test').Page, route: string) => {
  await page.goto(route, { waitUntil: 'commit' })
  const ready = await loginEmailInput(page).isVisible().catch(() => false)

  if (!ready) {
    await page.goto(route, { waitUntil: 'commit' })
  }
}

test.describe('login', () => {
  test('shows the login form', async ({ page }) => {
    await openAuthPage(page, '/auth')

    const emailInput = loginEmailInput(page)
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', /Tên đăng nhập hoặc email/i)
    await expect(loginPasswordInput(page)).toBeVisible()
    await expect(page.locator('button:has-text("Đăng nhập"):visible').first()).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await openAuthPage(page, '/auth')

    await loginEmailInput(page).fill(`invalid-${Date.now()}@example.com`)
    await loginPasswordInput(page).fill('DefinitelyWrongPassword123!')
    await page.locator('button:has-text("Đăng nhập"):visible').first().click()

    await expect
      .poll(async () => {
        const token = await getPersistedAccessToken(page)
        return token === null
      })
      .toBe(true)
    await expect(page).toHaveURL(/\/auth/)
  })

  test('validates empty login form', async ({ page }) => {
    await openAuthPage(page, '/auth')

    await page.locator('button:has-text("Đăng nhập"):visible').first().click()
    await expect(page).toHaveURL(/\/auth/)
  })

  test('shows the register form', async ({ page }) => {
    await page.goto('/auth?mode=signup', { waitUntil: 'commit' })

    await expect(signUpInput(page, 0)).toBeVisible()
    await expect(signUpInput(page, 1)).toBeVisible()
    await expect(signUpInput(page, 2)).toBeVisible()
    await expect(page.getByRole('button', { name: /Tạo tài khoản/i }).first()).toBeVisible()
  })

  test('validates empty register form without creating an account', async ({ page }) => {
    await page.goto('/auth?mode=signup', { waitUntil: 'commit' })

    await page.getByRole('button', { name: /Tạo tài khoản/i }).first().click()
    await expect(page).toHaveURL(/\/auth\?mode=signup/)
  })

  test('shows forgot password form without submitting it', async ({ page }) => {
    await page.goto('/forgot', { waitUntil: 'commit' })

    await expect(page.getByText(/Quên mật khẩu/i).first()).toBeVisible()
    await expect(page.getByPlaceholder(/learningplatform@hcmute\.com/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Gửi liên kết xác nhận/i })).toBeVisible()
  })

  test('logs in with a student test account when configured', async ({ page }) => {
    test.skip(!hasStudentCredentials(), 'Set TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD to run real login.')

    await login(page, getStudentCredentials())

    await expect
      .poll(async () => {
        const token = await getPersistedAccessToken(page)
        return Boolean(token)
      })
      .toBe(true)
  })
})
