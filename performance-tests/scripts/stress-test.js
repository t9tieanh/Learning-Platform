import { group, sleep } from 'k6'
import { get, assertOk } from '../helpers/http.js'
import { randomKeyword } from '../helpers/random.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
}

export const handleSummary = createHandleSummary('stress')

export default function () {
  group('Stress browse', () => {
    assertOk(get('/learning/courses?page=1&limit=12', { endpoint: 'course_list_stress' }), 'stress list')
    assertOk(
      get(`/learning/courses?page=1&limit=12&search=${encodeURIComponent(randomKeyword())}`, {
        endpoint: 'course_search_stress',
      }),
      'stress search'
    )
  })

  sleep(1)
}
