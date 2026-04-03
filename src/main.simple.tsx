import { createRoot } from "react-dom/client";
import AppSimple from "./App.simple.tsx";

console.log('🚀 Starting Simple App...');

// Simple DOM check
let rootElement = document.getElementById("root");

if (!rootElement) {
  console.log('❌ Root element not found, creating one...');
  rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
} else {
  console.log('✅ Root element found');
}

try {
  console.log('📦 Rendering AppSimple...');
  const root = createRoot(rootElement);
  root.render(AppSimple());
  console.log('✅ AppSimple rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  
  // Fallback content
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial; background: #f5f5f5; min-height: 100vh;">
      <h1 style="color: #333;">❌ React Error</h1>
      <p style="color: #666;">Error: ${error.message}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}
