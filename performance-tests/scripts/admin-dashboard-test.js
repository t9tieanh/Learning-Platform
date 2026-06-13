import { group, sleep } from 'k6'
import { getRoleAuth } from '../helpers/auth.js'
import { get, assertOk } from '../helpers/http.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  vus: 3,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
}

export const handleSummary = createHandleSummary('admin-dashboard')

export default function () {
  const auth = getRoleAuth('admin', { scenario: 'admin_dashboard' })

  group('Admin overview', () => {
    assertOk(get('/user/home-admin', { endpoint: 'admin_home', token: auth.accessToken }), 'admin home')
    assertOk(
      get('/learning/admin/business-performance?range=12m', {
        endpoint: 'admin_business_performance',
        token: auth.accessToken,
      }),
      'admin business performance'
    )
  })

  group('Admin supporting widgets', () => {
    assertOk(get('/user/admin/pending-actions', { endpoint: 'admin_pending_actions', token: auth.accessToken }), 'admin pending actions')
    assertOk(get('/user/admin/top-courses?limit=5', { endpoint: 'admin_top_courses', token: auth.accessToken }), 'admin top courses')
    assertOk(
      get('/user/admin/top-instructors?limit=5', { endpoint: 'admin_top_instructors', token: auth.accessToken }),
      'admin top instructors'
    )
    assertOk(get('/user/ad-certificates', { endpoint: 'admin_certificates', token: auth.accessToken }), 'admin certificates')
  })

  sleep(1)
}
