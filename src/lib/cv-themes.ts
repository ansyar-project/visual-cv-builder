// CV Theme System Configuration
export interface CVTheme {
  id: string;
  name: string;
  description: string;
  className: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    textOnPrimary: string;
    gradientStart: string;
    gradientEnd: string;
  };
  cssVars: {
    primary: string;
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    textOnPrimary: string;
    gradientStart: string;
    gradientEnd: string;
  };
}

export const CV_THEMES: CVTheme[] = [
  {
    id: "professional-blue",
    name: "Professional Blue",
    description: "Classic, professional look with blue accents",
    className: "", // Default theme, no additional class needed
    colors: {
      primary: "#3498db",
      accent: "#e74c3c",
      background: "#ffffff",
      textPrimary: "#2c3e50",
      textSecondary: "#7f8c8d",
      textOnPrimary: "#ffffff",
      gradientStart: "#f8f9fa",
      gradientEnd: "#e9ecef",
    },
    cssVars: {
      primary: "221.2 83.2% 53.3%",
      accent: "0 84.2% 60.2%",
      background: "0 0% 100%",
      textPrimary: "222.2 84% 4.9%",
      textSecondary: "215.4 16.3% 46.9%",
      textOnPrimary: "210 40% 98%",
      gradientStart: "210 40% 98%",
      gradientEnd: "214.3 31.8% 91.4%",
    },
  },
  {
    id: "modern-green",
    name: "Modern Green",
    description: "Fresh, eco-friendly design with green tones",
    className: "cv-theme-green",
    colors: {
      primary: "#27ae60",
      accent: "#16a085",
      background: "#ffffff",
      textPrimary: "#2c3e50",
      textSecondary: "#7f8c8d",
      textOnPrimary: "#ffffff",
      gradientStart: "#f8fdf9",
      gradientEnd: "#eef7f2",
    },
    cssVars: {
      primary: "142 76% 36%",
      accent: "168 76% 42%",
      background: "0 0% 100%",
      textPrimary: "222.2 84% 4.9%",
      textSecondary: "215.4 16.3% 46.9%",
      textOnPrimary: "210 40% 98%",
      gradientStart: "138 43% 98%",
      gradientEnd: "138 43% 94%",
    },
  },
  {
    id: "creative-purple",
    name: "Creative Purple",
    description: "Vibrant, creative design with purple highlights",
    className: "cv-theme-purple",
    colors: {
      primary: "#8e44ad",
      accent: "#9b59b6",
      background: "#ffffff",
      textPrimary: "#2c3e50",
      textSecondary: "#7f8c8d",
      textOnPrimary: "#ffffff",
      gradientStart: "#f9f7fc",
      gradientEnd: "#f0ebf5",
    },
    cssVars: {
      primary: "262 83% 58%",
      accent: "280 87% 47%",
      background: "0 0% 100%",
      textPrimary: "222.2 84% 4.9%",
      textSecondary: "215.4 16.3% 46.9%",
      textOnPrimary: "210 40% 98%",
      gradientStart: "262 43% 98%",
      gradientEnd: "262 43% 94%",
    },
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    description: "Sophisticated, minimal design with dark tones",
    className: "cv-theme-dark",
    colors: {
      primary: "#34495e",
      accent: "#2980b9",
      background: "#ffffff",
      textPrimary: "#2c3e50",
      textSecondary: "#7f8c8d",
      textOnPrimary: "#ffffff",
      gradientStart: "#fafbfc",
      gradientEnd: "#f1f3f4",
    },
    cssVars: {
      primary: "210 14% 22%",
      accent: "204 64% 44%",
      background: "0 0% 100%",
      textPrimary: "222.2 84% 4.9%",
      textSecondary: "215.4 16.3% 46.9%",
      textOnPrimary: "210 40% 98%",
      gradientStart: "210 14% 98%",
      gradientEnd: "210 14% 94%",
    },
  },
];

export const DEFAULT_THEME = CV_THEMES[0];

export function getThemeById(themeId: string): CVTheme {
  return CV_THEMES.find((theme) => theme.id === themeId) || DEFAULT_THEME;
}

export function applyThemeToElement(element: HTMLElement, themeId: string) {
  const theme = getThemeById(themeId);

  // Remove existing theme classes
  CV_THEMES.forEach((t) => {
    if (t.className) {
      element.classList.remove(t.className);
    }
  });

  // Apply new theme class
  if (theme.className) {
    element.classList.add(theme.className);
  }
}

export function getThemeColors(themeId: string) {
  const theme = getThemeById(themeId);
  return theme.colors;
}

export function getThemeCSSVars(themeId: string) {
  const theme = getThemeById(themeId);
  return theme.cssVars;
}
