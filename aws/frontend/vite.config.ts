
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.VITE_SERVER_HOST || "::",
    port: parseInt(process.env.VITE_SERVER_PORT || "8080"),
  },
  base: "./", // Add this to ensure assets are loaded with relative paths
  plugins: [
    react(),
    mode === 'development',
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
