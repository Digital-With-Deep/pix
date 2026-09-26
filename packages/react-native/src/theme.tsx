import * as React from "react";
import { useColorScheme } from "react-native";
import { rnTokens } from "@pix-ui/tokens/react-native";

export type PixScheme = "light" | "dark";
export type PixPalette = (typeof rnTokens.color)["light"];
export interface PixTheme {
  scheme: PixScheme;
  color: PixPalette;
  space: typeof rnTokens.space;
  radius: typeof rnTokens.radius;
  fontSize: typeof rnTokens.fontSize;
  fontWeight: typeof rnTokens.fontWeight;
  fontFamily: typeof rnTokens.fontFamily;
  duration: typeof rnTokens.duration;
}

const build = (scheme: PixScheme): PixTheme => ({
  scheme,
  color: rnTokens.color[scheme],
  space: rnTokens.space,
  radius: rnTokens.radius,
  fontSize: rnTokens.fontSize,
  fontWeight: rnTokens.fontWeight,
  fontFamily: rnTokens.fontFamily,
  duration: rnTokens.duration,
});

const PixContext = React.createContext<PixTheme>(build("light"));

export interface PixProviderProps {
  /** Force a scheme; omit to follow the device setting. */
  scheme?: PixScheme;
  children?: React.ReactNode;
}

/** Wrap your app once. Follows the OS light/dark setting unless `scheme` is set. */
export function PixProvider({ scheme, children }: PixProviderProps) {
  const os = useColorScheme();
  const active: PixScheme = scheme ?? (os === "dark" ? "dark" : "light");
  const theme = React.useMemo(() => build(active), [active]);
  return <PixContext.Provider value={theme}>{children}</PixContext.Provider>;
}

export const usePixTheme = () => React.useContext(PixContext);
