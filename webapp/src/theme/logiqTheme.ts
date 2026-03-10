import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
} from "@fluentui/react-components";

/**
 * Brand ramp based on #5b5fc7 (Microsoft Teams / Copilot purple).
 * All `appearance="primary"` Fluent UI components inherit from this.
 */
const logiqBrand: BrandVariants = {
  10: "#060616",
  20: "#14143b",
  30: "#1e1f5e",
  40: "#2d2e7f",
  50: "#3d3f9e",
  60: "#4e50b4",
  70: "#5b5fc7",
  80: "#7175d1",
  90: "#878bdb",
  100: "#9da0e4",
  110: "#b3b5ec",
  120: "#c9cbf3",
  130: "#dfe0f8",
  140: "#eeeffe",
  150: "#f5f5ff",
  160: "#ffffff",
};

export const logiqLightTheme = {
  ...createLightTheme(logiqBrand),
};

export const logiqDarkTheme = {
  ...createDarkTheme(logiqBrand),
};
