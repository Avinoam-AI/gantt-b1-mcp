import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import './index.css'
import App from './App.tsx'

// Register UI5 theme assets so the SAP components can switch to sap_horizon_dark
// (without these, only the default light theme is registered and dark mode falls back).
import '@ui5/webcomponents/dist/Assets.js'
import '@ui5/webcomponents-fiori/dist/Assets.js'
import '@ui5/webcomponents-react/dist/Assets.js'

// Register the specific UI5 icons we use (lightweight — avoids bundling AllIcons)
import '@ui5/webcomponents-icons/dist/add.js'
import '@ui5/webcomponents-icons/dist/download.js'
import '@ui5/webcomponents-icons/dist/decline.js'
import '@ui5/webcomponents-icons/dist/light-mode.js'
import '@ui5/webcomponents-icons/dist/dark-mode.js'

// Set the UI5 theme BEFORE first render so the boot sequence picks it up (avoids a
// race where UI5 boots light and only later flips). App keeps it in sync on toggle.
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
setTheme(prefersDark ? 'sap_horizon_dark' : 'sap_horizon')
document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
