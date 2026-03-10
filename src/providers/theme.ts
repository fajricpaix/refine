import { createTheme } from "@mui/material/styles";

const primary = "#c80000"

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primary,
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primary,
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

