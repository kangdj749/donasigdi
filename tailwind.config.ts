import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },

    extend: {
      /* ================= TYPO ================= */
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },

      /* ================= EFFECTS ================= */
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.08)",
        card: "0 6px 20px rgba(2, 6, 23, 0.06)",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },

  plugins: [],
};

export default config;
