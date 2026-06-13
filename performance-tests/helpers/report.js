import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

export function createHandleSummary(reportName) {
  return function handleSummary(data) {
    return {
      [`performance-tests/results/${reportName}-report.html`]: htmlReport(data),
      [`performance-tests/results/${reportName}-summary.json`]: JSON.stringify(data, null, 2),
      stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
  }
}
