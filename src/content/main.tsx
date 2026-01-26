import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

console.log("Content script loaded");
const container = document.createElement("div");
container.id = "note_extension_container";
document.body.appendChild(container);

createRoot(container).render(
  <StrictMode>
    <div className="p-4 bg-white border border-gray-300 rounded shadow-lg note-extension-popup">
      <h2 className="text-lg font-semibold mb-2">Note Extension</h2>
      <p className="text-sm text-gray-600">This is the content script popup UI.</p>
    </div>
  </StrictMode>,
)