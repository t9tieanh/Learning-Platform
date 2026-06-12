import { expect, test } from '@playwright/test'
import { getStudentCredentials, hasStudentCredentials, login } from '../helpers/auth.helper'

test.describe('login', () => {
  test('shows the login form', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' })

    const emailInput = page
      .getByTestId('login-email-input')
      .or(page.getByPlaceholder(/Tên đăng nhập hoặc email/i))
      .first()
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', /Tên đăng nhập hoặc email/i)
    await expect(page.getByTestId('login-password-input').or(page.getByPlaceholder(/Mật khẩu/i)).first()).toBeVisible()
    await expect(
      page
        .getByTestId('login-submit-button')
        .or(page.getByRole('button', { name: /^Đăng nhập$/i }))
        .first()
    ).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' })

    await page
      .getByTestId('login-email-input')
      .or(page.getByPlaceholder(/Tên đăng nhập hoặc email/i))
      .first()
      .fill(`invalid-${Date.now()}@example.com`)
    await page
      .getByTestId('login-password-input')
      .or(page.getByPlaceholder(/Mật khẩu/i))
      .first()
      .fill('DefinitelyWrongPassword123!')
    await page
      .getByTestId('login-submit-button')
      .or(page.getByRole('button', { name: /^Đăng nhập$/i }))
      .first()
      .click()

    await expect(
      page
        .getByText(/Đã có lỗi|lỗi|sai|không|invalid|unauthorized|failed/i)
        .first()
    ).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/auth/)
  })

  test('logs in with a student test account when configured', async ({ page }) => {
    test.skip(!hasStudentCredentials(), 'Set TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD to run real login.')

    await login(page, getStudentCredentials())

    await expect(page).not.toHaveURL(/\/auth/)
  })
})
