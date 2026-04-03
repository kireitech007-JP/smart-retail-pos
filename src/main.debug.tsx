import { createRoot } from "react-dom/client";
import AppDebug from "./App.debug.tsx";

// Minimal CSS untuk debug
const debugCSS = `
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
  }
  
  #root {
    min-height: 100vh;
  }
`;

// Inject CSS
const styleElement = document.createElement('style');
styleElement.textContent = debugCSS;
document.head.appendChild(styleElement);

// Render debug app
console.log('Starting debug app...');

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('Root element found, rendering AppDebug...');
  createRoot(rootElement).render(<AppDebug />);
} else {
  console.error('Root element not found!');
  
  // Fallback: create root element
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  console.log('Created new root element, rendering AppDebug...');
  createRoot(newRoot).render(<AppDebug />);
}
