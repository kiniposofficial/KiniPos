import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register PWA service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Kini Pos versi terbaru tersedia! Perbarui sekarang?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Kini Pos siap bekerja offline!')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
