/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          bg: '#F4EFE6',
          dark: '#1A1814',
          'content-bg': '#FBF8F2',
          'sidebar-border': 'rgba(244, 239, 230, 0.12)',
          'topbar-border': 'rgba(26, 24, 20, 0.14)',
          'topbar-bg': 'rgba(251, 248, 242, 0.6)',
          'sidebar-active': '#2C2722',
          'accent': '#B8842E',
          'accent-soft': '#D9B26B',
          'search-bg': '#ECE5D8',
          'text-muted': '#6B6052',
        }
      },
      spacing: {
        'sidebar': '248px',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'nav-item': '13.5px',
        'nav-title': '11px',
        'breadcrumb': '11px',
        'heading-top': '24px',
        'logo-text': '17px',
      }
    },
  },
  plugins: [],
}