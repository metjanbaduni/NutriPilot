/**
 * Tailwind config for NutriPilot dashboard styling.
 * - Scans Vite entry + React source files for class usage.
 * - Defines design tokens (surface, ink, macro colors, shadows) aligned to dashboard mocks.
 * - Example usage: <section class="bg-surface text-ink shadow-card">...</section>
 *   Example @apply: @apply bg-surface text-ink border border-stroke;
 */
/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F5F7FB',
        panel: '#FFFFFF',
        ink: '#0F172A',
        muted: '#64748B',
        stroke: '#E2E8F0',
        accent: {
          light: '#7DD3FC',
          DEFAULT: '#0EA5E9',
          dark: '#0369A1'
        },
        macro: {
          calories: '#3B82F6',
          protein: '#22C55E',
          carbs: '#F59E0B',
          fat: '#EF4444'
        },
        state: {
          success: '#16A34A',
          warning: '#F97316',
          danger: '#DC2626'
        }
      },
      boxShadow: {
        card: '0 10px 25px -12px rgba(15, 23, 42, 0.25)',
        panel: '0 8px 20px -12px rgba(15, 23, 42, 0.2)'
      },
      borderRadius: {
        card: '18px'
      }
    }
  },
  plugins: []
};

export default config;
