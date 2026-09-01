import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign cross-origin popup closures from polluting console / window errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    if (
      reason?.code === 'auth/popup-closed-by-user' ||
      reason?.code === 'auth/cancelled-popup-request' ||
      reason?.code === 'auth/popup-blocked' ||
      reason?.message?.includes('popup-closed-by-user') ||
      reason?.message?.includes('OAuth popup closed')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
