import { expect, test } from '@playwright/test'
import { getStudentCredentials, hasStudentCredentials, loginByApi } from '../helpers/auth.helper'

const hasLearningEnv = () => hasStudentCredentials() && Boolean(process.env.TEST_LEARNING_COURSE_ID)

const openLearningCourse = async (page: import('@playwright/test').Page) => {
  test.skip(!hasLearningEnv(), 'Set TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD, and TEST_LEARNING_COURSE_ID.')

  await loginByApi(page, getStudentCredentials())
  await page.goto(`/course-page/${process.env.TEST_LEARNING_COURSE_ID}`, { waitUntil: 'commit' })
  await expect(page).toHaveURL(new RegExp(`/course-page/${process.env.TEST_LEARNING_COURSE_ID}`))
  await expect(page.locator('main').first()).toBeVisible()
}

test.describe('learning page', () => {
  test.describe.configure({ mode: 'serial' })

  test('loads the enrolled course learning shell', async ({ page }) => {
    await openLearningCourse(page)

    await expect(page.getByText(/Trở lại/i).first()).toBeVisible()
    await expect(page.getByText(/Tổng quan/i).first()).toBeVisible()
  })

  test('shows the first lesson video or lesson viewer area', async ({ page }) => {
    await openLearningCourse(page)

    await expect(page.locator('video').first().or(page.getByText(/File không có sẵn|Nội dung không đạt yêu cầu/i).first())).toBeVisible()
  })

  test('shows lesson tabs below the video area', async ({ page }) => {
    await openLearningCourse(page)

    await expect(page.getByRole('button', { name: /Tổng quan/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Hỏi đáp/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Ghi chú/i }).first()).toBeVisible()
  })

  test('opens the lesson Q&A tab without submitting a question', async ({ page }) => {
    await openLearningCourse(page)

    await page.getByRole('button', { name: /Hỏi đáp/i }).first().click()
    await expect(page.getByText(/Thảo luận bài học|Chưa có thảo luận/i).first()).toBeVisible()
    await expect(page.getByPlaceholder(/Viết câu hỏi/i).first()).toBeVisible()
  })

  test('shows course sidebar content on desktop', async ({ page }) => {
    await openLearningCourse(page)

    await expect(page.locator('aside').or(page.getByText(/Nội dung khóa học|Chương|Bài học/i).first())).toBeVisible()
  })
})
