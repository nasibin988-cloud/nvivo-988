/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aura Dark theme colors
        background: '#050811',
        surface: '#0A0F1C',
        'surface-elevated': '#111827',
        border: 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#EDEDED',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        accent: {
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          cyan: '#06B6D4',
          green: '#10B981',
          red: '#EF4444',
          orange: '#F97316',
        },
      },
    },
  },
  plugins: [],
};
