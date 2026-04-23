import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App'
import appCss from './views/App.css?inline'

console.log("Content script loaded");
const container = document.createElement("div");
container.id = "note_extension_container";
document.body.appendChild(container);

const shadowRoot = container.attachShadow({ mode: 'open' });

const style = document.createElement('style');
// :root in a shadow stylesheet doesn't match shadow-tree elements; :host does.
// Tailwind's preflight sets base typography on `html`, which also doesn't match inside
// shadow DOM — those properties would otherwise inherit from the host page's body/html
// (different font on Stack Overflow vs Wikipedia). Define them explicitly on :host first.
// Unlayered rules win over any @layer rule, so this border is guaranteed to apply
// regardless of how Tailwind resolves --tw-border-style inside shadow DOM.
const shadowPreamble = `
:host {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
}
[data-slot="textarea"] {
  border: 1px solid oklch(0.87 0 0);
}
`;
style.textContent = shadowPreamble + appCss.replace(/:root/g, ':host');
shadowRoot.appendChild(style);

const mountDiv = document.createElement('div');
shadowRoot.appendChild(mountDiv);

createRoot(mountDiv).render(
  <StrictMode>
    <App portalContainer={mountDiv} />
  </StrictMode>,
)
