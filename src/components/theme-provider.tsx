import { createContext, type ReactNode, useContext } from "react";
import type { WidgetConfig } from "../types";

type ThemeContextValue = {
  config: WidgetConfig;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  borderRadius: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  config: WidgetConfig;
  children: ReactNode;
};

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const primaryColor = config.theme?.primaryColor || "#3a36f5";
  const secondaryColor = config.theme?.secondaryColor || "#0a0a0a";
  const borderRadius = parseBorderRadius(config.theme?.borderRadius || "md");

  const themeValue: ThemeContextValue = {
    config,
    primaryColor,
    secondaryColor,
    logoUrl: config.logoUrl,
    borderRadius,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div
        className="pw-root payment-widget"
        style={
          {
            "--pw-primary": primaryColor,
            "--pw-secondary": secondaryColor,
            "--pw-border-radius": borderRadius,
            "--pw-logo-url": config.logoUrl ? `url(${config.logoUrl})` : "",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}

function parseBorderRadius(radius: string): string {
  const presets = {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  };

  return presets[radius as keyof typeof presets] || radius;
}
