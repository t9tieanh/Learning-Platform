// eslint-disable-next-line import/namespace
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,html,js,jsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

export default config