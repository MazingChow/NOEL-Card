
import React from 'react';
import ReactDOM from 'react-dom/client';
import htm from 'htm';
import App from './App';

const html = htm.bind(React.createElement);
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(html`
    <${React.StrictMode}>
      <${App} />
    <//>
  `);
  
  // Hide initial loader once React takes over
  const loader = document.getElementById('initial-loader');
  if (loader) loader.style.opacity = '0';
  setTimeout(() => loader?.remove(), 500);
}
