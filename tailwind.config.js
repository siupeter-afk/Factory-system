/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FactoryOS tokens (see src/index.css :root)
        brand: {
          DEFAULT: 'var(--c-brand)',
          deep: 'var(--c-brand-deep)',
        },
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        line: 'var(--c-line)',
        surface: 'var(--c-surface)',
        ok: 'var(--c-ok)',
        warn: 'var(--c-warn)',
        crit: 'var(--c-crit)',
        // legacy palette used by pages that predate the framework
        factory: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        display: ['Archivo Variable', '-apple-system', 'Segoe UI', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
