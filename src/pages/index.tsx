import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Plus, Minus, ShoppingBag, Trash2, X, MessageCircle, Phone, User, KeyRound, CreditCard, Wallet, Lock, Heart } from "lucide-react";
import { categories, useProducts, effectivePrice, discountPercent, isOutOfStock, type Product } from "@/lib/products";
import aryomKoruImage from "@/assets/aryom-koru.jpg";

const WHATSAPP_NUMBER = "905324556076";
const MARKET_NAME = "Aryom Market";

export default function IndexPage() {
  const products = useProducts();
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem("aryom_favorites_v1") || "[]")); }
    catch { return new Set<string>(); }
  });
  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("aryom_favorites_v1", JSON.stringify([...next]));
      return next;
    });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    apartmentCode: "",
    payment: "kart" as "kart" | "nakit",
    note: "",
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (isOutOfStock(p)) return false;
      if (activeCat === "favs") return favorites.has(p.id);
      const catOk = activeCat === "all" || p.category === activeCat;
      const q = query.trim().toLowerCase();
      const qOk = !q || p.name.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [activeCat, query, products, favorites]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const p = products.find((x) => x.id === id);
          return p ? { ...p, qty } : null;
        })
        .filter(Boolean) as (Product & { qty: number })[],
    [cart, products]
  );

  const total = cartItems.reduce((s, i) => s + effectivePrice(i) * i.qty, 0);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id: string) =>
    setCart((c) => {
      const n = (c[id] || 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-6 py-3 lg:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <div className="overflow-hidden rounded-md border border-[#0b3d2e]/70 shadow-soft" style={{ width: "clamp(56px, 6vw, 72px)" }}>
              <img
                src={aryomKoruImage}
                alt="Aryom Koru 1. Etap"
                loading="lazy"
                className="block aspect-square w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold uppercase leading-none tracking-tight text-[#0b3d2e] flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg">ARYOM KORU</span>
                <span className="text-2xl sm:text-3xl">1.</span>
                <span className="text-base sm:text-lg text-[#0b3d2e]/80">ETAP</span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Sakinlere Özel Market
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün, marka veya kategori arayın…"
              className="h-14 w-full rounded-full border border-border bg-secondary/50 pl-14 pr-6 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-gold/60 focus:bg-card focus:ring-4 focus:ring-gold/10"
            />
          </div>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Sepeti aç"
            className="relative flex shrink-0 items-center gap-2 rounded-full border border-gold bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-[var(--shadow-green)] transition hover:opacity-90"
          >
            <ShoppingBag className="h-5 w-5 text-gold-foreground" strokeWidth={1.8} />
            <span className="hidden sm:inline">Sepetim</span>
            <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">
              {itemCount}
            </span>
            <span className="hidden md:inline text-muted-foreground">·</span>
            <span className="hidden md:inline font-semibold">₺{total.toFixed(2)}</span>
          </button>
        </div>
      </header>

      {/* Body layout */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10">
        {/* Sidebar categories */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl text-foreground">Kategoriler</h2>
            <span className="text-xs text-muted-foreground">{products.length} ürün</span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {categories.map((c) => {
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    active
                      ? "bg-gold/10 font-semibold text-gold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span>{c.name}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                </button>
              );
            })}
            <button
              onClick={() => setActiveCat("favs")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                activeCat === "favs"
                  ? "bg-rose-500/10 font-semibold text-rose-500"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className={`h-3.5 w-3.5 ${activeCat === "favs" ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} strokeWidth={activeCat === "favs" ? 0 : 2} />
                Favorilerim
                {favorites.size > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                    {favorites.size}
                  </span>
                )}
              </span>
              {activeCat === "favs" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
            </button>
          </nav>
        </aside>

        {/* Products grid */}
        <main>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold">
                Aryom Market · Rezidans 168
              </div>
              <h1 className="mt-1.5 font-display text-3xl leading-tight text-foreground">
                {categories.find((c) => c.id === activeCat)?.name ?? "Tümü"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sakinlerimize özel, kapınıza teslim seçkin ürünler.
              </p>
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">
              {filtered.length} ürün listeleniyor
            </span>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => {
              const active = activeCat === c.id;
              const isFirsat = c.id === "firsat";
              return (
                <button
                  key={`main-${c.id}`}
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "border-gold bg-gold text-gold-foreground"
                      : isFirsat
                      ? "border-[var(--orange)]/70 bg-card text-[var(--orange)] animate-pulse hover:bg-[var(--orange)]/10"
                      : "border-border bg-card text-foreground hover:border-gold/50 hover:bg-secondary"
                  }`}
                >
                  {isFirsat && !active && <span className="mr-1">🔥</span>}
                  {c.name}
                </button>
              );
            })}
            <button
              onClick={() => setActiveCat("favs")}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                activeCat === "favs"
                  ? "border-rose-500 bg-rose-500 text-white shadow-[0_8px_24px_-10px_rgba(244,63,94,0.6)]"
                  : "border-rose-400/40 bg-card text-rose-500 hover:border-rose-400 hover:bg-rose-50/10"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${activeCat === "favs" ? "fill-white" : "fill-rose-500"}`} strokeWidth={0} />
              Favorilerim
              {favorites.size > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeCat === "favs" ? "bg-white/20 text-white" : "bg-rose-500/15 text-rose-500"}`}>
                  {favorites.size}
                </span>
              )}
            </button>
          </div>

          {activeCat === "all" && (
            <button
              onClick={() => setActiveCat("firsat")}
              className="mb-6 flex w-full items-center justify-between overflow-hidden rounded-xl border-l-4 border-l-[var(--orange)] border border-border bg-card px-6 py-5 text-left transition hover:shadow-[var(--shadow-soft)]"
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--orange)]">
                  🔥 Haftanın Fırsat Ürünleri
                </div>
                <div className="mt-1 font-display text-xl text-foreground">
                  Bu haftaya özel seçkin indirimler
                </div>
              </div>
              <span className="rounded-full bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-orange)]">
                Keşfet →
              </span>
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
              Aradığınız kriterlere uygun ürün bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filtered.map((p) => {
                const qty = cart[p.id] || 0;
                const isFirsat = p.category === "firsat";
                const isFav = favorites.has(p.id);
                const pct = discountPercent(p);
                return (
                  <article
                    key={p.id}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${
                      isFirsat ? "border-gold/50 ring-1 ring-gold/20" : "border-border hover:border-gold/40"
                    }`}
                  >
                    {/* Badges */}
                    {isFirsat && (
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-[var(--orange)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-[var(--shadow-orange)]">
                        🔥 Fırsat
                      </div>
                    )}
                    {pct > 0 && (
                      <div className={`absolute ${isFirsat ? "left-2 top-7" : "left-2 top-2"} z-10 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white`}>
                        %{pct}
                      </div>
                    )}
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFav(p.id)}
                      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                      className={`absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full border transition-all ${
                        isFav
                          ? "border-rose-400/60 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                          : "border-border/60 bg-card/80 text-muted-foreground hover:border-rose-300 hover:text-rose-400"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 transition ${isFav ? "fill-rose-500 text-rose-500" : ""}`} strokeWidth={2} />
                    </button>

                    {/* Image */}
                    <div className="grid h-48 place-items-center overflow-hidden rounded-lg bg-[#f7f7f7] ring-1 ring-border">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-5xl">{p.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-2.5 flex-1">
                      <div className="inline-flex rounded-full border border-border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {categories.find((c) => c.id === p.category)?.name}
                      </div>
                      <h3 className="mt-1.5 font-display text-[15px] leading-snug text-foreground line-clamp-2">
                        {p.name}
                      </h3>
                    </div>

                    {/* Price + Add */}
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        {pct > 0 ? (
                          <>
                            <div className="text-[10px] font-medium text-muted-foreground line-through">₺{p.price.toFixed(2)}</div>
                            <div className="text-lg font-bold leading-none tracking-tight text-red-600">₺{effectivePrice(p).toFixed(2)}</div>
                          </>
                        ) : (
                          <div className="text-lg font-bold leading-none tracking-tight text-gold">₺{p.price.toFixed(2)}</div>
                        )}
                        <div className="mt-0.5 text-[10px] text-muted-foreground">/ {p.unit}</div>
                      </div>
                      {qty === 0 ? (
                        <button
                          onClick={() => add(p.id)}
                          className="flex items-center gap-1 rounded-full bg-gold px-3 py-2 text-xs font-semibold text-gold-foreground shadow-[var(--shadow-green)] transition hover:opacity-90"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Ekle
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5 rounded-full border-2 border-gold bg-gold/10 p-0.5">
                          <button onClick={() => dec(p.id)} className="grid h-7 w-7 place-items-center rounded-full text-gold transition hover:bg-gold hover:text-gold-foreground">
                            <Minus className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                          <span className="min-w-[22px] text-center text-sm font-bold text-foreground">{qty}</span>
                          <button onClick={() => add(p.id)} className="grid h-7 w-7 place-items-center rounded-full text-gold transition hover:bg-gold hover:text-gold-foreground">
                            <Plus className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          cartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!cartOpen}
      >
        <div
          onClick={() => setCartOpen(false)}
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-[0_10px_60px_-15px_oklch(0.22_0.02_60_/_0.35)] transition-transform duration-300 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-br from-secondary/60 to-transparent px-6 py-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Sepetiniz
              </div>
              <div className="mt-1 font-display text-2xl text-foreground">
                {itemCount} ürün
              </div>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              aria-label="Sepeti kapat"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Sepetiniz henüz boş.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Bir ürüne dokunarak eklemeye başlayın.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-border overflow-y-auto">
                {cartItems.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 px-6 py-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary text-xl">
                      {i.image ? (
                        <img src={i.image} alt={i.name} loading="lazy" className="h-full w-full  object-contain p-2"  />
                      ) : (
                        i.emoji
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {i.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₺{effectivePrice(i).toFixed(2)} / {i.unit}
                        {discountPercent(i) > 0 && (
                          <span className="ml-2 text-muted-foreground line-through">₺{i.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
                      <button
                        onClick={() => dec(i.id)}
                        className="grid h-7 w-7 place-items-center rounded-full text-foreground transition hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[20px] text-center text-xs font-semibold text-foreground">
                        {i.qty}
                      </span>
                      <button
                        onClick={() => add(i.id)}
                        className="grid h-7 w-7 place-items-center rounded-full text-foreground transition hover:bg-
