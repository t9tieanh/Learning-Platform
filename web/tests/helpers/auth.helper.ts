import { expect, Page } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env', quiet: true })

export const loginRoute = '/auth'
const authStorageKey = 'user-storage'
const apiBaseUrl = `${(process.env.VITE_API || 'https://core-learnova.t9tieanh.io.vn').replace(/\/$/, '')}/api/v1`

type LoginCredentials = {
  email: string
  password: string
}

type Role = 'student' | 'instructor' | 'admin'

const credentialEnvNames: Record<Role, { email: string; password: string }> = {
  student: {
    email: 'TEST_STUDENT_EMAIL',
    password: 'TEST_STUDENT_PASSWORD'
  },
  instructor: {
    email: 'TEST_INSTRUCTOR_EMAIL',
    password: 'TEST_INSTRUCTOR_PASSWORD'
  },
  admin: {
    email: 'TEST_ADMIN_EMAIL',
    password: 'TEST_ADMIN_PASSWORD'
  }
}

export const hasStudentCredentials = () =>
  Boolean(process.env.TEST_STUDENT_EMAIL && process.env.TEST_STUDENT_PASSWORD)

export const getStudentCredentials = (): LoginCredentials => {
  return getCredentials('student')
}

export const hasCredentials = (role: Role) => {
  const envNames = credentialEnvNames[role]
  return Boolean(process.env[envNames.email] && process.env[envNames.password])
}

export const getCredentials = (role: Role): LoginCredentials => {
  const envNames = credentialEnvNames[role]
  const email = process.env[envNames.email]
  const password = process.env[envNames.password]

  if (!email || !password) {
    throw new Error(`${envNames.email} and ${envNames.password} are required for ${role} login tests.`)
  }

  return { email, password }
}

export const login = async (page: Page, { email, password }: LoginCredentials) => {
  await page.goto(loginRoute, { waitUntil: 'commit' })

  const emailInput = page
    .getByTestId('login-email-input')
    .or(page.getByPlaceholder(/Tên đăng nhập hoặc email/i))
    .or(page.locator('input:not([type="password"]):visible'))
    .first()
  const passwordInput = page
    .getByTestId('login-password-input')
    .or(page.locator('input[type="password"]:visible'))
    .first()
  const submitButton = page.getByTestId('login-submit-button').or(page.getByRole('button', { name: /^Đăng nhập$/i })).first()

  await expect(emailInput).toBeVisible()
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await submitButton.click()
}

export const getPersistedAccessToken = (page: Page) =>
  page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as { state?: { data?: { accessToken?: string } | null } }
      return parsed?.state?.data?.accessToken ?? null
    } catch {
      return null
    }
  }, authStorageKey)

export const loginByApi = async (page: Page, { email, password }: LoginCredentials) => {
  const response = await page.request.post(`${apiBaseUrl}/auth`, {
    data: {
      username: email,
      password
    }
  })

  expect(response.ok(), 'Expected auth API request to succeed.').toBeTruthy()

  const body = (await response.json()) as {
    code?: number
    result?: {
      accessToken?: string
      refreshToken?: string
      userId?: string
      id?: string
      _id?: string
      name?: string
      userName?: string
      username?: string
      email?: string
      avatarUrl?: string
      role?: string
      isVip?: boolean
    }
  }

  expect(body.code, 'Expected auth API to return success code.').toBe(200)
  expect(body.result?.accessToken, 'Expected auth API to return an access token.').toBeTruthy()

  const persistedAuth = {
    accessToken: body.result?.accessToken as string,
    refreshToken: body.result?.refreshToken as string,
    userId: body.result?.userId || body.result?.id || body.result?._id || '',
    name: body.result?.name || body.result?.userName || body.result?.username,
    username: body.result?.username || body.result?.userName,
    email: body.result?.email,
    avatarUrl: body.result?.avatarUrl,
    role: body.result?.role,
    isVip: body.result?.isVip ?? false
  }

  await page.addInitScript(
    ({ storageKey, value }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          state: {
            data: value
          },
          version: 0
        })
      )
    },
    { storageKey: authStorageKey, value: persistedAuth }
  )
}
