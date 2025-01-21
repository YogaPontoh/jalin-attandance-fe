import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3778C2',
        secondary: '#28559A'
      },
      fontFamily: {
        sans: ["var(--font-lato)", "sans-serif"], 
        geist: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
