import "@tailwindcss/vite/client";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--pw-primary)",
        secondary: "var(--pw-secondary)",
      },
      borderRadius: {
        widget: "var(--pw-border-radius)",
      },
      fontFamily: {
        widget: "var(--pw-font-family)",
      },
      boxShadow: {
        widget: "var(--pw-shadow)",
      },
    },
  },
};
