import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App'
import './views/App.css'

console.log("Content script loaded");
const container = document.createElement("div");
container.id = "note_extension_container";
document.body.appendChild(container);

createRoot(container).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)