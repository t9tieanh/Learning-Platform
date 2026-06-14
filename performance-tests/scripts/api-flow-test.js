import { group, sleep } from 'k6'
import { credentials, defaultCourseId, flags, hasCredential } from '../helpers/config.js'
import { login } from '../helpers/auth.js'
import { get, post, assertOk, parseJson } from '../helpers/http.js'
import { randomCourseId, randomKeyword } from '../helpers/random.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    'http_req_duration{endpoint:guest_course_list_flow}': ['p(95)<1200'],
    'http_req_duration{endpoint:guest_course_search_flow}': ['p(95)<1500'],
    'http_req_duration{endpoint:user_my_learning_flow}': ['p(95)<1500'],
    'http_req_duration{endpoint:user_cart_add_flow}': ['p(95)<1500'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.95'],
  },
}

export const handleSummary = createHandleSummary('api-flow')

function resolveCourseId() {
  const listResponse = get('/learning/courses?page=1&limit=6', { endpoint: 'guest_course_list_flow' })
  assertOk(listResponse, 'flow list')
  const payload = parseJson(listResponse)
  return payload?.result?.items?.[0]?.id || randomCourseId() || defaultCourseId
}

export default function () {
  let courseId = defaultCourseId

  group('Guest view course list', () => {
    courseId = resolveCourseId()
    sleep(1)
  })

  group('Guest search course', () => {
    const response = get(`/learning/courses?page=1&limit=6&search=${encodeURIComponent(randomKeyword())}`, {
      endpoint: 'guest_course_search_flow',
    })
    assertOk(response, 'flow search')
    const payload = parseJson(response)
    courseId = payload?.result?.items?.[0]?.id || courseId
    sleep(1)
  })

  group('Guest view course detail', () => {
    if (courseId) {
      assertOk(get(`/learning/courses/${courseId}`, { endpoint: 'guest_course_detail_flow' }), 'flow detail')
    }
    sleep(1)
  })

  if (!hasCredential('user')) {
    return
  }

  const auth = login(credentials.user.login, credentials.user.password, { scenario: 'api_flow' })

  group('User view my learning', () => {
    assertOk(
      get('/learning/courses-student/self?page=0&size=10', {
        endpoint: 'user_my_learning_flow',
        token: auth.accessToken,
      }),
      'flow my learning'
    )
    sleep(1)
  })

  if (!flags.enableWriteFlows) {
    group('User cart and order write flow skipped', () => {
      console.warn('TODO: set ENABLE_WRITE_FLOWS=true and ENABLE_SANDBOX_ORDER_FLOW=true to exercise cart/order endpoints safely')
      sleep(1)
    })
    return
  }

  group('User add course to cart if enabled', () => {
    if (courseId) {
      const cartResponse = post(
        '/sale/cart',
        { courseId },
        {
          endpoint: 'user_cart_add_flow',
          token: auth.accessToken,
        }
      )
      assertOk(cartResponse, 'flow add to cart')
    }
    sleep(1)
  })

  if (!flags.enableSandboxOrderFlow) {
    group('User order flow skipped', () => {
      console.warn('TODO: order/payment flow requires ENABLE_SANDBOX_ORDER_FLOW=true and sandbox payment environment')
      sleep(1)
    })
    return
  }

  group('User create sandbox order if enabled', () => {
    const orderResponse = post(
      '/sale/orders',
      { items: [{ courseId }] },
      {
        endpoint: 'user_create_order_flow',
        token: auth.accessToken,
      }
    )
    assertOk(orderResponse, 'flow create order')
    sleep(1)
  })
}
