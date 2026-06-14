import { check, sleep } from 'k6'
import { credentials, defaultCourseId, hasCredential } from '../helpers/config.js'
import { login } from '../helpers/auth.js'
import { get, assertOk, parseJson } from '../helpers/http.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

export const handleSummary = createHandleSummary('smoke')

function selectCourseId() {
  const courseListResponse = get('/learning/courses?limit=1&page=1', { endpoint: 'course_list_smoke' })
  assertOk(courseListResponse, 'course list smoke')
  const payload = parseJson(courseListResponse)
  const fetchedId = payload?.result?.items?.[0]?.id || payload?.result?.content?.[0]?.id
  return fetchedId || defaultCourseId
}

export default function () {
  const userStatus = get('/user', { endpoint: 'user_status_smoke' })
  assertOk(userStatus, 'user status smoke')

  const saleStatus = get('/sale/status', { endpoint: 'sale_status_smoke' })
  assertOk(saleStatus, 'sale status smoke')

  const courseId = selectCourseId()
  if (courseId) {
    const detailResponse = get(`/learning/courses/${courseId}`, { endpoint: 'course_detail_smoke' })
    check(detailResponse, {
      'course detail smoke status is 2xx': (res) => res.status >= 200 && res.status < 300,
    })
  }

  if (hasCredential('user')) {
    const auth = login(credentials.user.login, credentials.user.password, { scenario: 'smoke' })
    check(auth.response, {
      'login smoke returns access token': () => Boolean(auth.accessToken),
    })

    const profileResponse = get('/self', {
      endpoint: 'profile_smoke',
      token: auth.accessToken,
    })
    assertOk(profileResponse, 'profile smoke')
  }

  sleep(1)
}
