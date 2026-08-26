import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Lee los "paths" de tsconfig.app.json para que Vite tambien resuelva
    // el alias @/. Antes hacia falta el plugin vite-tsconfig-paths; desde
    // Vite 8 viene incluido, y quitarlo elimina tsconfck (sin mantenimiento).
    tsconfigPaths: true,
  },
});
