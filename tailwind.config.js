/**
 * Design tokens from docs/DESIGN_SYSTEM.md.
 * Do not add ad-hoc colors/spacing outside this scale in component code —
 * every value used in a screen should trace back to a token defined here.
 */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FAF9F6",
        surface: "#FFFFFF",
        "surface-alt": "#F1EFE8",
        ink: "#1C1B19",
        "ink-muted": "#6B6659",
        "ink-faint": "#A39D8E",
        border: "#E4E1D8",
        brand: "#22211F",
        "brand-subtle": "#E7E5DE",
        accent: "#9C7A3C",
        positive: "#3F7A5C",
        "positive-subtle": "#E4EEE7",
        negative: "#B5473A",
        "negative-subtle": "#F3E3E0",
        warning: "#B8862E",
        "warning-subtle": "#F5EBD7",
      },
      fontFamily: {
        sans: ["IBMPlexSans_400Regular"],
        "sans-medium": ["IBMPlexSans_500Medium"],
        "sans-semibold": ["IBMPlexSans_600SemiBold"],
        mono: ["IBMPlexMono_500Medium"],
      },
      borderRadius: {
        card: "8px",
        button: "8px",
        input: "6px",
        sheet: "20px",
        dialog: "10px",
      },
    },
  },
  plugins: [],
};
