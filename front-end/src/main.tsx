import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { auth } from "./firebase";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App auth={auth} />
  </StrictMode>
);
