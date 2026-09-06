import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register the specific UI5 icons we use (lightweight — avoids bundling AllIcons)
import '@ui5/webcomponents-icons/dist/add.js'
import '@ui5/webcomponents-icons/dist/download.js'
import '@ui5/webcomponents-icons/dist/decline.js'
import '@ui5/webcomponents-icons/dist/light-mode.js'
import '@ui5/webcomponents-icons/dist/dark-mode.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
