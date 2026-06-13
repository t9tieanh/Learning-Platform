import { group, sleep } from 'k6'
import { credentials, hasCredential } from '../helpers/config.js'
import { login } from '../helpers/auth.js'
import { get, assertOk } from '../helpers/http.js'
import { randomKeyword } from '../helpers/random.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '1h', target: 100 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
}

export const handleSummary = createHandleSummary('soak')

export default function () {
  group('Soak public traffic', () => {
    assertOk(get('/learning/courses?page=1&limit=12', { endpoint: 'course_list_soak' }), 'soak list')
    assertOk(
      get(`/learning/courses?page=1&limit=8&search=${encodeURIComponent(randomKeyword())}`, {
        endpoint: 'course_search_soak',
      }),
      'soak search'
    )
  })

  if (hasCredential('user')) {
    group('Soak authenticated read traffic', () => {
      const auth = login(credentials.user.login, credentials.user.password, { scenario: 'soak' })
      assertOk(
        get('/learning/courses-student/self?page=0&size=10', {
          endpoint: 'my_learning_soak',
          token: auth.accessToken,
        }),
        'soak my learning'
      )
    })
  }

  sleep(1)
}
