import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { auth } from "./firebase";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App auth={auth} />
    </ThemeProvider>
  </StrictMode>
);
