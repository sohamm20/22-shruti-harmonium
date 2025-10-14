/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 10% 0%, rgba(79, 112, 255, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255, 120, 180, 0.12) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(38, 194, 255, 0.12) 0%, transparent 55%)",
      },
      boxShadow: {
        aurora: "0 24px 45px rgba(5, 7, 18, 0.45)",
        key: "0 8px 32px rgba(0, 0, 0, 0.3)",
        keyHover: "0 15px 35px rgba(0, 0, 0, 0.4)",
        keyActive: "0 10px 25px rgba(102, 126, 234, 0.4)",
        badge: "0 12px 24px rgba(109, 126, 255, 0.25)",
      },
      colors: {
        background: "#060913",
        surface: "rgba(16, 23, 40, 0.92)",
        surfaceHover: "rgba(21, 29, 47, 0.96)",
        badge: "rgba(111, 125, 255, 0.14)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
