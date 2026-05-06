import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#06B6D4",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#0EA5E9",
        page: "#F6F9FF",
        pageSoft: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceMuted: "#F1F5F9",
        borderSoft: "#E2E8F0",
        borderStrong: "#CBD5E1",
        ink: "#0F172A",
        muted: "#64748B",
        code: "#0B1220"
      },
      borderRadius: {
        panel: "12px",
        control: "9px",
        code: "10px"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.06)",
        soft: "0 6px 18px rgba(15, 23, 42, 0.05)",
        focus: "0 0 0 4px rgba(37, 99, 235, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
