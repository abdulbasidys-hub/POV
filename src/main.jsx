import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { readSignals } from "./pov/readSignals.js";
import "./styles/tokens.css";
import "./styles/global.css";

// Collected once, before React, so history is read and written exactly once per visit.
const signals = readSignals();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App base={signals} />
  </StrictMode>
);
