import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles-professional.css'
import App from './App-professional.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
