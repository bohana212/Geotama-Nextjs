import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  // preflight & container dimatikan supaya tidak bentrok dengan catalog.css
  // (katalog publik punya reset dan class .container sendiri).
  corePlugins: { preflight: false, container: false },
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
