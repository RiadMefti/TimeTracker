import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/node_modules/**'],
    },
    host: "0.0.0.0",
    strictPort: true,
    port: 5173,
  },
});
