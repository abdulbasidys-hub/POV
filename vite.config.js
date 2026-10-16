import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// three / r3f only load with the lazy hero scene, so text paints before the 3D arrives.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2019",
    chunkSizeWarningLimit: 1400,
  },
});
