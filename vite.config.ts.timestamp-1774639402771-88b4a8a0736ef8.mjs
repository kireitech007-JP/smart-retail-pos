// vite.config.ts
import { defineConfig } from "file:///C:/Users/JP%20Production/Documents/GitHub/smart-retail-pos/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/JP%20Production/Documents/GitHub/smart-retail-pos/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/JP%20Production/Documents/GitHub/smart-retail-pos/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\JP Production\\Documents\\GitHub\\smart-retail-pos";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: true,
    // Allow external connections
    port: 5173,
    // Standard Vite port
    hmr: {
      overlay: true
      // Enable error overlay
    },
    open: true
    // Auto-open browser
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: mode === "development",
    // Enable sourcemap in development
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    }
  },
  base: mode === "production" ? "/" : "/",
  optimizeDeps: {
    include: ["react", "react-dom", "@supabase/supabase-js"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKUCBQcm9kdWN0aW9uXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcc21hcnQtcmV0YWlsLXBvc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSlAgUHJvZHVjdGlvblxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHNtYXJ0LXJldGFpbC1wb3NcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0pQJTIwUHJvZHVjdGlvbi9Eb2N1bWVudHMvR2l0SHViL3NtYXJ0LXJldGFpbC1wb3Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiB0cnVlLCAvLyBBbGxvdyBleHRlcm5hbCBjb25uZWN0aW9uc1xyXG4gICAgcG9ydDogNTE3MywgLy8gU3RhbmRhcmQgVml0ZSBwb3J0XHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogdHJ1ZSwgLy8gRW5hYmxlIGVycm9yIG92ZXJsYXlcclxuICAgIH0sXHJcbiAgICBvcGVuOiB0cnVlLCAvLyBBdXRvLW9wZW4gYnJvd3NlclxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBhc3NldHNEaXI6IFwiYXNzZXRzXCIsXHJcbiAgICBzb3VyY2VtYXA6IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiwgLy8gRW5hYmxlIHNvdXJjZW1hcCBpbiBkZXZlbG9wbWVudFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBiYXNlOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFwiL1wiIDogXCIvXCIsXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1csU0FBUyxvQkFBb0I7QUFDclksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUE7QUFBQSxJQUNYO0FBQUEsSUFDQSxNQUFNO0FBQUE7QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsV0FBVyxTQUFTO0FBQUE7QUFBQSxJQUNwQixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTSxTQUFTLGVBQWUsTUFBTTtBQUFBLEVBQ3BDLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsdUJBQXVCO0FBQUEsRUFDekQ7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
