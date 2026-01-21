// Centralized color constants for YAHT
// Based on the original color palette from Navbar, App.jsx, and HomeCard

export const colors = {
  // Main backgrounds
  bg: {
    light: "#bbbbbbff",
    dark: "#222222ff",
  },

  // Card/elevated surface backgrounds (subtle contrast)
  cardBg: {
    light: "#a8a8a8",
    dark: "#2a2a2a",
  },

  // Primary text
  text: {
    light: "#333333ff",
    dark: "#cececeff",
  },

  // Secondary/muted text
  textMuted: {
    light: "#666666",
    dark: "#999999",
  },

  // Borders
  border: {
    light: "#999999",
    dark: "#444444",
  },

  // Hover states
  hover: {
    light: "#777777ff",
    dark: "#777777ff",
  },

  // Success/completion (green)
  success: {
    light: "#38a169",
    dark: "#68d391",
  },

  // Warning/at-risk (orange)
  warning: {
    light: "#dd6b20",
    dark: "#ed8936",
  },

  // Error/danger (red)
  error: {
    light: "#e53e3e",
    dark: "#fc8181",
  },

  // Gradient accent colors (from navbar logo)
  gradient: {
    from: "#007241",   // Dark green
    via: "#94002D",    // Burgundy
    to: "#A65F00",     // Orange-brown
  },

  // GitHub-style heatmap green scale
  heatmap: [
    "#ebedf0",  // 0 - no activity
    "#9be9a8",  // 1 - light
    "#40c463",  // 2 - medium
    "#30a14e",  // 3 - high
    "#216e39",  // 4 - very high
  ],

  // Chart colors for multi-series
  chart: [
    "#38a169",  // Green
    "#3182ce",  // Blue
    "#d69e2e",  // Amber
    "#e53e3e",  // Red
    "#805ad5",  // Purple
    "#00b5d8",  // Cyan
  ],

  // Grid lines for charts
  grid: {
    light: "#a0a0a0",
    dark: "#404040",
  },
};

// Gradient animation keyframes (for use with @emotion/react)
export const gradientAnimation = `
  0% { background-position: 0% 100%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;
