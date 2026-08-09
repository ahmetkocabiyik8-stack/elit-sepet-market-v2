import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import IndexPage from '@/pages/index';
import AdminPage from '@/pages/admin';
import aryomKoruImage from '@/assets/aryom-koru.jpg';

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

// ---- Açılış ekranı: site ilk açıldığında ~1 saniyeliğine görünür, sonra yumuşakça kaybolur ----
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 650);
    const doneTimer = setTimeout(onDone, 950);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);
  return (
    <div
      className={`fixed inset-0 z-[100] flex lg:hidden flex-col items-center justify-center bg-[#0b3d2e] transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="overflow-hidden rounded-2xl border-2 border-white/15 shadow-2xl"
        style={{ width: 96, height: 96 }}
      >
        <img src={aryomKoruImage} alt="Aryom Koru 1. Etap" className="h-full w-full object-cover" />
      </div>
      <div className="mt-5 text-center">
        <div className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Aryom Koru <span className="text-3xl">1.</span> Etap
        </div>
        <div className="mt-1.5 text-[11px] uppercase tracking-[0.28em] text-white/70">
          Sakinlere Özel Market
        </div>
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
