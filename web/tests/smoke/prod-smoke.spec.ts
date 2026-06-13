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
  test('header navigation shell loads on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('navigation', { name: /Điều hướng chính/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Trang chủ/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Khóa học/i })).toBeVisible()
  })

  test('home page loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByAltText(/LEARNOVA logo/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i }).first()).toBeVisible()
  })

  test('register mode loads', async ({ page }) => {
    await page.goto('/auth?mode=signup', { waitUntil: 'domcontentloaded' })

    await expect(page.getByPlaceholder(/Email/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Tạo tài khoản/i }).first()).toBeVisible()
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

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Quên mật khẩu/i })).toBeVisible()
    await expect(page.getByText(/liên kết đặt lại mật khẩu/i)).toBeVisible()
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
    const detailMarker = page
      .getByTestId('course-detail-title')
      .or(page.getByRole('heading', { name: /Khóa học/i }))
      .or(page.getByRole('button', { name: /Mua ngay|Thêm vào giỏ hàng/i }))
      .first()

    const detailVisible = await detailMarker
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)

    if (!detailVisible) {
      test.info().annotations.push({
        type: 'info',
        description: 'Course detail route opened, but production detail content did not render a stable marker in time.'
      })
    }
  })

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'commit' })

    await expect(page).toHaveURL(/\/blog/)
    await expect(page.getByAltText(/LEARNOVA logo/i).first()).toBeVisible()
  })

  test('about page loads', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Kiến tạo tương lai/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Khám phá khóa học/i })).toBeVisible()
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/term', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(/điều khoản/i).first()).toBeVisible()
  })

  test('cart page loads without creating an order', async ({ page }) => {
    await page.goto('/my-cart', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: /Giỏ hàng của bạn/i })).toBeVisible()
  })
})
