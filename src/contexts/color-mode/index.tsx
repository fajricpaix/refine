import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme, lightTheme } from "../../providers/theme";

type ColorMode = "light" | "dark";

type ColorModeContextType = {
  mode: ColorMode;
  toggleColorMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [mode, setMode] = useState<ColorMode>("dark");

  // 🔹 Init mode (client only)
  useEffect(() => {
    const storedMode = localStorage.getItem("colorMode") as ColorMode | null;

    if (storedMode) {
      setMode(storedMode);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  // 🔹 Persist to localStorage
  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      mode === "light"
        ? lightTheme : darkTheme,
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
