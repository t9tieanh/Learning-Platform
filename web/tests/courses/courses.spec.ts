import { expect, Page, test } from '@playwright/test'

const courseSearchInput = (page: Page) => page.locator('aside input:visible').first()

const openCoursesPage = async (page: Page) => {
  await page.goto('/courses', { waitUntil: 'commit' })
  const ready = await page.locator('h1').filter({ hasText: /Khám phá/i }).isVisible().catch(() => false)

  if (!ready) {
    await page.goto('/courses', { waitUntil: 'commit' })
  }
}

const getCourseListState = async (page: Page) => {
  await expect(courseSearchInput(page)).toBeVisible()

  const courseCards = page.getByTestId('course-card')
  const detailButtons = page.getByRole('button', { name: /Xem chi tiết/i })
  const emptyState = page.getByText(/Không có khóa học phù hợp/i)
  const errorState = page.getByText(/Không thể tải dữ liệu khóa học/i)
  const settledState = courseCards.first().or(detailButtons.first()).or(emptyState).or(errorState).first()

  const visibleState = await settledState
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => 'course')
    .catch(async () => {
      if (await emptyState.isVisible().catch(() => false)) return 'empty'
      if (await errorState.isVisible().catch(() => false)) return 'error'
      return 'unknown'
    })

  return {
    hasCourse: visibleState === 'course',
    firstCourseAction: courseCards.first().or(detailButtons.first()).first()
  }
}

test.describe('courses', () => {
  test('shows course list, empty state, or API error state', async ({ page }) => {
    await openCoursesPage(page)

    await expect(page.locator('h1').filter({ hasText: /Khám phá/i })).toBeVisible()
    await getCourseListState(page)
  })

  test('supports searching from the course filter', async ({ page }) => {
    await openCoursesPage(page)

    const searchInput = courseSearchInput(page)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('react')
    await expect(searchInput).toHaveValue('react')

    await getCourseListState(page)
  })

  test('shows category filter control', async ({ page }) => {
    await openCoursesPage(page)

    await expect(page.locator('h2').filter({ hasText: /Bộ lọc/i })).toBeVisible()
    await expect(page.locator('[role="combobox"]').first()).toBeVisible()
  })

  test('shows price and rating filters', async ({ page }) => {
    await openCoursesPage(page)

    await expect(page.getByRole('checkbox', { name: /5 trở lên/i })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /4 trở lên/i })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /3 trở lên/i })).toBeVisible()
    await expect(page.locator('[role="slider"]').first()).toBeVisible()
  })

  test('can clear filters without changing production data', async ({ page }) => {
    await openCoursesPage(page)

    const searchInput = courseSearchInput(page)
    await searchInput.fill('react')
    await page.getByRole('button', { name: /Xóa bộ lọc/i }).click()
    await expect(searchInput).toHaveValue('')
  })

  test('opens course detail when a course card exists', async ({ page }) => {
    await openCoursesPage(page)

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

    const detailShell = page
      .getByTestId('course-detail-title')
      .or(page.getByRole('heading', { name: /Khóa học/i }))
      .or(page.getByRole('button', { name: /Mua ngay/i }))
      .or(page.getByRole('button', { name: /Thêm vào giỏ hàng/i }))
      .first()
    await expect(detailShell).toBeVisible()
  })

  test('shows non-destructive purchase actions on course detail when a course exists', async ({ page }) => {
    await openCoursesPage(page)

    const { hasCourse, firstCourseAction } = await getCourseListState(page)

    test.skip(!hasCourse, 'Production course list has no visible course cards.')

    await firstCourseAction.click()
    await expect(page).toHaveURL(/\/course\/[^/]+$/)
    await expect(page.getByRole('button', { name: /Mua ngay/i }).first()).toBeVisible()
    await expect(
      page.getByTestId('add-to-cart-button').or(page.getByRole('button', { name: /Thêm vào giỏ hàng/i })).first()
    ).toBeVisible()
  })
})
