import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PWAUpdater from './components/PWAUpdater.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <PWAUpdater />
  </StrictMode>,
)
