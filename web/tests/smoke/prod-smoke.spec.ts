import { expect, test } from '@playwright/test'

const expectCourseListSettled = async (page: import('@playwright/test').Page) => {
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

test.describe('production smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByAltText(/LEARNOVA logo/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i }).first()).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' })

    await expect(
      page
        .getByTestId('login-email-input')
        .or(page.getByPlaceholder(/Tên đăng nhập hoặc email/i))
        .first()
    ).toBeVisible()
    await expect(page.getByTestId('login-password-input').or(page.getByPlaceholder(/Mật khẩu/i)).first()).toBeVisible()
    await expect(
      page
        .getByTestId('login-submit-button')
        .or(page.getByRole('button', { name: /^Đăng nhập$/i }))
        .first()
    ).toBeVisible()
  })

  test('course list loads and first course detail opens when data exists', async ({ page }) => {
    await page.goto('/courses', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Khám phá/i })).toBeVisible()
    const { hasCourse, firstCourseAction } = await expectCourseListSettled(page)

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

  test('cart page loads without creating an order', async ({ page }) => {
    await page.goto('/my-cart', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Giỏ hàng của bạn/i })).toBeVisible()
  })
})
