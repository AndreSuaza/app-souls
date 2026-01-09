import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tournament: {
          dark: {
            bg: "rgb(var(--tournament-dark-bg) / <alpha-value>)",
            surface: "rgb(var(--tournament-dark-surface) / <alpha-value>)",
            hero: "rgb(var(--tournament-dark-hero) / <alpha-value>)",
            border: "rgb(var(--tournament-dark-border) / <alpha-value>)",
            accent: "rgb(var(--tournament-dark-accent) / <alpha-value>)",
            header: "rgb(var(--tournament-dark-header) / <alpha-value>)",
            muted: "rgb(var(--tournament-dark-muted) / <alpha-value>)",
            "muted-strong":
              "rgb(var(--tournament-dark-muted-strong) / <alpha-value>)",
            "muted-hover":
              "rgb(var(--tournament-dark-muted-hover) / <alpha-value>)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
