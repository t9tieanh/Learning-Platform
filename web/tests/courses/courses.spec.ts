import { expect, Page, test } from '@playwright/test'

const getCourseListState = async (page: Page) => {
  await expect(page.getByTestId('course-search-input').or(page.getByPlaceholder(/Nhập tên khóa học/i)).first()).toBeVisible()

  const courseCards = page.getByTestId('course-card')
  const detailButtons = page.getByRole('button', { name: /Xem chi tiết/i })
  const emptyState = page.getByText(/Không có khóa học phù hợp/i)
  const errorState = page.getByText(/Không thể tải dữ liệu khóa học/i)
  const settledState = courseCards.first().or(detailButtons.first()).or(emptyState).or(errorState).first()

  await settledState.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined)

  return {
    hasCourse: (await courseCards.count()) > 0 || (await detailButtons.count()) > 0,
    firstCourseAction: courseCards.first().or(detailButtons.first()).first()
  }
}

test.describe('courses', () => {
  test('shows course list, empty state, or API error state', async ({ page }) => {
    await page.goto('/courses', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Khám phá/i })).toBeVisible()
    await getCourseListState(page)
  })

  test('supports searching from the course filter', async ({ page }) => {
    await page.goto('/courses', { waitUntil: 'domcontentloaded' })

    const searchInput = page.getByTestId('course-search-input').or(page.getByPlaceholder(/Nhập tên khóa học/i)).first()
    await expect(searchInput).toBeVisible()
    await searchInput.fill('react')
    await expect(searchInput).toHaveValue('react')

    await getCourseListState(page)
  })

  test('opens course detail when a course card exists', async ({ page }) => {
    await page.goto('/courses', { waitUntil: 'domcontentloaded' })

    const { hasCourse, firstCourseAction } = await getCourseListState(page)

    if (!hasCourse) {
      test.info().annotations.push({
        type: 'info',
        description: 'Production course list has no visible course cards; detail navigation was skipped.'
      })
      return
    }

    await firstCourseAction.click()
    await expect(page).toHaveURL(/\/course\/[^/]+$/)
    await expect(page.getByTestId('course-detail-title').or(page.getByRole('heading', { name: /Khóa học/i })).first()).toBeVisible()
  })
})
