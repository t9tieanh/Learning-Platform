/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          // MÀU CHỦ ĐẠO
          DEFAULT: '#3B82F6', // blue-500
          hover: '#2563eb',
          foreground: '#FFFFFF'
        },
        secondary: {
          // MÀU PHỤ
          DEFAULT: '#6366F1', // indigo-500
          foreground: '#FFFFFF'
        },
        destructive: {
          // MÀU CẢNH BÁO
          DEFAULT: '#EF4444', // red-500
          foreground: '#FFFFFF'
        },
        muted: {
          // MÀU CHO BORDER, TEXT, PLACEHOLDER
          DEFAULT: '#E5E7EB', // gray-200
          foreground: '#374151' // gray-700
        },
        accent: {
          // MÀU NHẤN
          DEFAULT: '#2563eb', // emerald-500
          hover: '#2563eb',
          foreground: '#FFFFFF'
        },
        popover: {
          // MÀU CHO POPOVER, DROPDOWN, TOOLTIP
          DEFAULT: '#F9FAFB', // gray-50
          foreground: '#111827' // gray-900
        },
        card: {
          // MÀU CHO THẺ CARD COMPONENTS
          DEFAULT: '#FFFFFF',
          foreground: '#111827'
        },
        brand: {
          // MÀU LOGO, NAVBAR, HEADER
          light: '#60A5FA', // blue-400
          DEFAULT: '#3B82F6', // blue-500
          dark: '#2563EB' // blue-600
        },
        dashboard: {
          'stat-bg': '#f1f5f9', // bg xám nhạt
          'stat-border': '#cbd5e1', // border xám
          success: '#16a34a', // xanh lá
          info: '#0284c7', // xanh dương
          warning: '#facc15', // vàng
          error: '#dc2626', // đỏ
          primary: '#29919C',
          second: '#BCDCDC'
        },
        gradient: {
          success: '#19ba54',
          warning: '#f97c22',
          primary: '#186ed7',
          secondary: '#453253'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      transitionDuration: {
        '4000': '4000ms',
        '3600': '3600ms',
        '1600': '1600ms',
        '1400': '1400ms',
        '1800': '1800ms',
        '2200': '2200ms',
        '6000': '6000ms',
        '10000': '10000ms'
      },
      transitionDelay: {
        '1600': '1600ms',
        '800': '800ms',
        '1200': '1200ms'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
