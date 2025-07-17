import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'dropdown': '1350px', // Custom breakpoint for dropdown button
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card-background)",
          foreground: "var(--card-foreground)",
          border: "var(--card-border)",
          hover: "var(--card-hover)",
        },
        button: {
          DEFAULT: "var(--button-background)",
          foreground: "var(--button-foreground)",
          hover: "var(--button-hover)",
        },
        input: {
          DEFAULT: "var(--input-background)",
          foreground: "var(--input-foreground)",
          border: "var(--input-border)",
          focus: "var(--input-focus)",
          placeholder: "var(--input-placeholder)",
          "disabled-bg": "var(--input-disabled-bg)",
          "disabled-fg": "var(--input-disabled-fg)",
        },
        label: {
          DEFAULT: "var(--label-foreground)",
          required: "var(--label-required)",
          optional: "var(--label-optional)",
        },
        form: {
          error: "var(--form-error)",
          success: "var(--form-success)",
        },
        checkbox: {
          DEFAULT: "var(--checkbox-background)",
          border: "var(--checkbox-border)",
          checked: "var(--checkbox-checked)",
        },
        select: {
          DEFAULT: "var(--select-background)",
          foreground: "var(--select-foreground)",
          border: "var(--select-border)",
          focus: "var(--select-focus)",
          chevron: "var(--select-chevron)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          link: "var(--text-link)",
          "link-hover": "var(--text-link-hover)",
        },
        header: {
          DEFAULT: "var(--header-background)",
          foreground: "var(--header-foreground)",
          border: "var(--header-border)",
        },
        dropdown: {
          DEFAULT: "var(--dropdown-background)",
          foreground: "var(--dropdown-foreground)",
          border: "var(--dropdown-border)",
          hover: "var(--dropdown-hover)",
        },
        table: {
          DEFAULT: "var(--table-background)",
          "header-bg": "var(--table-header-background)",
          "header-fg": "var(--table-header-foreground)",
          "cell-fg": "var(--table-cell-foreground)",
          "cell-fg-strong": "var(--table-cell-foreground-strong)",
          border: "var(--table-border)",
          "row-hover": "var(--table-row-hover)",
          striped: "var(--table-striped)",
        },
        status: {
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
        }
      },
      ringColor: {
        DEFAULT: "var(--input-focus-ring)",
        focus: "var(--input-focus-ring)",
        checkbox: "var(--checkbox-focus-ring)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
