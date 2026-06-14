import { group, sleep } from 'k6'
import { get, assertOk } from '../helpers/http.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '10s', target: 300 },
    { duration: '1m', target: 300 },
    { duration: '10s', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
  },
}

export const handleSummary = createHandleSummary('spike')

export default function () {
  group('Spike public endpoints', () => {
    assertOk(get('/learning/courses?page=1&limit=8', { endpoint: 'course_list_spike' }), 'spike list')
    assertOk(get('/sale/status', { endpoint: 'sale_status_spike' }), 'spike sale status')
  })

  sleep(1)
}
