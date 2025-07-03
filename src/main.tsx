
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("main.tsx: Starting application");

try {
  const rootElement = document.getElementById("root");
  console.log("main.tsx: Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  console.log("main.tsx: React root created");
  
  root.render(<App />);
  console.log("main.tsx: App rendered successfully");
} catch (error) {
  console.error("main.tsx: Failed to render app:", error);
  
  // Fallback rendering
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Errore di Avvio</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">L'applicazione non è riuscita ad avviarsi.</p>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; text-align: left; font-size: 0.875rem;">${error}</pre>
        </div>
      </div>
    `;
  }
}
