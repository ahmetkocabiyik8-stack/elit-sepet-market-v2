import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// PWA: service worker kaydı (Android'de "ana ekrana ekle" / uygulama gibi kurulum için gerekli)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // sessizce geç, service worker olmasa da site normal çalışmaya devam eder
    });
  });
}
