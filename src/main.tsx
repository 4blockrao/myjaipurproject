// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");

if (rootEl) {
  console.log("[Bootstrap] Root found, mounting React");
  try {
    const root = createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <div>
          <h1>TEST MOUNT</h1>
          <App />
        </div>
      </React.StrictMode>
    );
    console.log("[Bootstrap] React mounted successfully");
  } catch (error) {
    console.error("[Bootstrap] React mount error:", error);
  }
} else {
  console.error("[Bootstrap] Root element not found");
}
