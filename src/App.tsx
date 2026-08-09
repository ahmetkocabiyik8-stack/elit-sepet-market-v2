import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import IndexPage from '@/pages/index';
import AdminPage from '@/pages/admin';
import aryomHavuzImage from '@/assets/aryom-havuz.jpg';

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sayfa bulunamadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-gold-foreground transition hover:opacity-90"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}

// ---- Açılış ekranı: site ilk açıldığında ~2,5 saniyeliğine tam ekran görünür, sonra yumuşakça kaybolur ----
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2100);
    const doneTimer = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-end overflow-hidden transition-opacity duration-[450ms] ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes splashImgIn {
          0% { opacity: 0; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashTextIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Tam ekran fotoğraf */}
      <img
        src={aryomHavuzImage}
        alt="Aryom Koru 1. Etap"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: "splashImgIn 1400ms cubic-bezier(0.22,1,0.36,1) both" }}
      />
      {/* Okunabilirlik için karartma gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#082b21] via-[#082b21]/45 to-[#082b21]/10" />

      <div className="relative z-10 mb-16 text-center" style={{ animation: "splashTextIn 600ms ease-out 350ms both" }}>
        <div className="font-display text-3xl font-bold uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          Aryom Koru <span className="text-4xl text-gold">1.</span> Etap
        </div>
        <div className="mt-2 text-[12px] uppercase tracking-[0.32em] text-white/80">
          Sakinlere Özel Market
        </div>
      </div>

      <div className="relative z-10 mb-10 flex gap-1.5" style={{ animation: "splashTextIn 600ms ease-out 550ms both" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-gold"
            style={{ animation: `splashDot 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={IndexPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </>
  );
}

export default App;
