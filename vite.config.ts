import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allow external connections
    port: 5173, // Standard Vite port
    hmr: {
      overlay: true, // Enable error overlay
    },
    open: true, // Auto-open browser
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: mode === "development", // Enable sourcemap in development
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: mode === "production" ? "/" : "/",
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
}));
