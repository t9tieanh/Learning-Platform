import { expect, Page } from '@playwright/test'

export const loginRoute = '/auth'

type LoginCredentials = {
  email: string
  password: string
}

export const hasStudentCredentials = () =>
  Boolean(process.env.TEST_STUDENT_EMAIL && process.env.TEST_STUDENT_PASSWORD)

export const getStudentCredentials = (): LoginCredentials => {
  const email = process.env.TEST_STUDENT_EMAIL
  const password = process.env.TEST_STUDENT_PASSWORD

  if (!email || !password) {
    throw new Error('TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD are required for student login tests.')
  }

  return { email, password }
}

export const login = async (page: Page, { email, password }: LoginCredentials) => {
  await page.goto(loginRoute, { waitUntil: 'domcontentloaded' })

  const emailInput = page
    .getByTestId('login-email-input')
    .or(page.getByPlaceholder(/Tên đăng nhập hoặc email/i))
    .first()
  const passwordInput = page.getByTestId('login-password-input').or(page.getByPlaceholder(/Mật khẩu/i)).first()
  const submitButton = page.getByTestId('login-submit-button').or(page.getByRole('button', { name: /^Đăng nhập$/i })).first()

  await expect(emailInput).toBeVisible()
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await submitButton.click()

  await expect
    .poll(
      async () => {
        const path = new URL(page.url()).pathname
        const stillOnAuth = path === loginRoute
        const loginButtonVisible = await page
          .getByRole('button', { name: /đăng nhập/i })
          .first()
          .isVisible()
          .catch(() => false)

        return !stillOnAuth || !loginButtonVisible
      },
      { message: 'Expected login to redirect or authenticated UI to appear.' }
    )
    .toBe(true)
}
