import { group, sleep } from 'k6'
import { getRoleAuth } from '../helpers/auth.js'
import { get, assertOk, parseJson } from '../helpers/http.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  vus: 3,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
}

export const handleSummary = createHandleSummary('instructor-dashboard')

export default function () {
  const auth = getRoleAuth('instructor', { scenario: 'instructor_dashboard' })
  const profileResponse = get('/self', {
    endpoint: 'instructor_self_profile',
    token: auth.accessToken,
  })
  assertOk(profileResponse, 'instructor self profile')
  const profilePayload = parseJson(profileResponse)
  const inferredUserId = auth.userId || profilePayload?.result?.id || profilePayload?.result?.userId
  const currentYear = new Date().getFullYear()

  if (!inferredUserId) {
    console.warn('TODO: could not infer instructorId from login response or /self, so statistic/chart calls were skipped.')
    return
  }

  group('Instructor overview', () => {
    assertOk(
      get(`/instructor/statistic?userId=${encodeURIComponent(inferredUserId)}`, {
        endpoint: 'instructor_statistic',
        token: auth.accessToken,
      }),
      'instructor statistic'
    )
    assertOk(
      get(`/instructor/chart?year=${currentYear}&userId=${encodeURIComponent(inferredUserId)}`, {
        endpoint: 'instructor_chart',
        token: auth.accessToken,
      }),
      'instructor chart'
    )
  })

  group('Instructor course and analytics', () => {
    const courseListResponse = get('/learning/instructor/courses?page=1&limit=10', {
      endpoint: 'instructor_course_list',
      token: auth.accessToken,
    })
    assertOk(courseListResponse, 'instructor course list')
    assertOk(
      get(
        `/learning/courses-instructor/analytics/learners?instructorId=${encodeURIComponent(inferredUserId)}&year=${currentYear}`,
        {
          endpoint: 'instructor_learners_analytics',
          token: auth.accessToken,
        }
      ),
      'instructor learners analytics'
    )
    assertOk(
      get(
        `/learning/courses-instructor/analytics/revenue?instructorId=${encodeURIComponent(inferredUserId)}&year=${currentYear}`,
        {
          endpoint: 'instructor_revenue_analytics',
          token: auth.accessToken,
        }
      ),
      'instructor revenue analytics'
    )
  })

  sleep(1)
}
