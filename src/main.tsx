import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './style.css';
import { ligarToques } from './toque.ts';

ligarToques();

// Offline na mesa: sem sinal, a ficha abre do cache. Só no site publicado; em
// desenvolvimento o cache atrapalharia ver as mudanças.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
