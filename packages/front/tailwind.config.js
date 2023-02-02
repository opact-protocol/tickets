module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "background-page": "#ffffff40",
        "dark-grafiti": "#303030",
        "dark-grafiti-medium": "#434343",
        "dark-grafiti-light": "#716E6E",
        "soft-blue": "#606CD2",
        "soft-blue-medium": "#7D89F0",
        "soft-blue-light": "#98A3FC",
        "soft-blue-normal": "#D3D8FF",
        aqua: "#47C6E2",
        "aqua-medium": "#77D3E7",
        "aqua-light": "#B0E0EB",
        "deep-blue": "#2489FF",
        "deep-blue-medium": "#5CA7FF",
        "deep-blue-light": "#8DC2FF",
        green: "#07CF9F",
        "green-medium": "#98E2D0",
        "green-light": "#BDFBEC",
        "shine-blue": "#0BB6FF",
        "shine-blue-medium": "#7ED8FF",
        "shine-blue-light": "#C5EEFF",
        orange: "#FF800B",
        "orange-medium": "#FFA552",
        "orange-light": "#FFDDBD",
        purple: "#930BFF",
        "purple-medium": "#C173FF",
        "purple-light": "#E6C6FF",
        pink: "#FF0B71",
        "pink-medium": "#FF6FAB",
        "pink-light": "#FFC4DD",
        error: "#FF2741",
        "error-2": "#FFE5E9",
        "error-3": "#AA0014",
        warning: "#FFCA41",
        "warning-2": "#F0E7D1",
        "warning-3": "#AE7D00",
        success: "#25AE75",
        "success-2": "#D9EBE3",
        "success-3": "#0E8654",
        info: "#2C8DFF",
        "info-2": "#D8EAFF",
        "info-3": "#0059C2",
      },
      backgroundImage: {
        "soft-blue-from-deep-blue":
          "linear-gradient(90deg, #606CD2 0%, #8DC1FF 100%)",
        "hover-button":
          "linear-gradient(90deg, #E8EAFF 2.74%, #8DC1FF 173.63%);",
      },
      animation: {
        "fade-in": "fade-in 0.5s linear forwards",
        marquee: "marquee var(--marquee-duration) linear infinite",
        "spin-slow": "spin 4s linear infinite",
        "spin-slower": "spin 6s linear infinite",
        "spin-reverse": "spin-reverse 1s linear infinite",
        "spin-reverse-slow": "spin-reverse 4s linear infinite",
        "spin-reverse-slower": "spin-reverse 6s linear infinite",
        "slide-left":
          "slide-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
        "slide-right":
          "slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
        loading: "loading 1s alternate infinite",
      },
      keyframes: {
        "slide-left": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-520px)",
          },
        },
        "slide-right": {
          "0%": {
            transform: "translateX(-520px)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        loading: {
          "0%": {
            transform: "scale(2)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
      },
      boxShadow: {
        sm: "0px 4px 10px rgba(96, 108, 210, 0.2), 0px 2px 4px rgba(96, 108, 210, 0.35)",
      },
    },
  },
  plugins: [],
};
