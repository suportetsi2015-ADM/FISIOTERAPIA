import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminPortal } from './components/AdminPortal';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminPortal onBackToSite={() => { window.location.href = '/'; }} />
  </StrictMode>
);
