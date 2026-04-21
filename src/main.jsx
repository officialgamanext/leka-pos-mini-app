import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PWAUpdater from './components/PWAUpdater.jsx'

// Disable DevTools if configured
if (import.meta.env.VITE_DISABLE_DEVTOOLS === 'true') {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <PWAUpdater />
  </StrictMode>,
)
