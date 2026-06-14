import { check } from 'k6'
import { browser } from 'k6/browser'
import { WEB_URL, flags } from '../helpers/config.js'
import { createHandleSummary } from '../helpers/report.js'

export const options = {
  scenarios: {
    browser: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
      vus: 1,
      iterations: 1,
      maxDuration: '2m',
    },
  },
  thresholds: {
    browser_web_vital_lcp: ['p(95)<2500'],
    browser_web_vital_cls: ['p(95)<0.1'],
  },
}

export const handleSummary = createHandleSummary('browser')

export default async function () {
  const page = await browser.newPage()

  try {
    await page.goto(WEB_URL, { waitUntil: 'networkidle' })
    await check(page, {
      'home title exists': async (p) => (await p.title()).length > 0,
    })

    if (!flags.enableBrowserLogin) {
      console.warn('TODO: browser login remains opt-in. Set ENABLE_BROWSER_LOGIN=true after validating selectors in the running UI.')
      return
    }
  } finally {
    await page.close()
  }
}
