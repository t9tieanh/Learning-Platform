import { group, sleep } from 'k6'
import { credentials, defaultCourseId, hasCredential } from '../helpers/config.js'
import { login } from '../helpers/auth.js'
import { get, assertOk, parseJson } from '../helpers/http.js'
import { randomCourseId, randomKeyword, randomLimit, randomPage } from '../helpers/random.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration{endpoint:course_list_load}': ['p(95)<1000'],
    'http_req_duration{endpoint:course_search_load}': ['p(95)<1500'],
    'http_req_duration{endpoint:course_detail_load}': ['p(95)<1200'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
}

export const handleSummary = createHandleSummary('load')

function resolveCourseIdFromList() {
  const response = get(`/learning/courses?page=${randomPage()}&limit=${randomLimit()}`, {
    endpoint: 'course_list_load',
  })
  assertOk(response, 'load course list')
  const payload = parseJson(response)
  return payload?.result?.items?.[0]?.id || payload?.result?.content?.[0]?.id || randomCourseId() || defaultCourseId
}

export default function () {
  let selectedCourseId = defaultCourseId

  group('Guest browse course list', () => {
    selectedCourseId = resolveCourseIdFromList()
    sleep(1)
  })

  group('Guest search courses', () => {
    const keyword = encodeURIComponent(randomKeyword())
    const response = get(`/learning/courses?page=1&limit=8&search=${keyword}`, {
      endpoint: 'course_search_load',
    })
    assertOk(response, 'load course search')
    const payload = parseJson(response)
    selectedCourseId = payload?.result?.items?.[0]?.id || selectedCourseId
    sleep(1)
  })

  group('Guest view course detail', () => {
    if (selectedCourseId) {
      const response = get(`/learning/courses/${selectedCourseId}`, {
        endpoint: 'course_detail_load',
      })
      assertOk(response, 'load course detail')
    }
    sleep(1)
  })

  if (hasCredential('user')) {
    group('User login and view my learning', () => {
      const auth = login(credentials.user.login, credentials.user.password, { scenario: 'load' })
      const learningResponse = get('/learning/courses-student/self?page=0&size=10', {
        endpoint: 'my_learning_load',
        token: auth.accessToken,
      })
      assertOk(learningResponse, 'my learning load')
      sleep(1)
    })
  }
}
