import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles-business.css'
import { AppWithFileManager } from './AppWithFileManager.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithFileManager />
  </StrictMode>,
)
