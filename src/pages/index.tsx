import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Plus, Minus, ShoppingBag, Trash2, X, MessageCircle, Phone, User, KeyRound, CreditCard, Wallet, Lock, Heart, Play, ShieldCheck, Home, LayoutGrid } from "lucide-react";
import { categories, useProducts, effectivePrice, discountPercent, isOutOfStock, PROMO_ID, HERO_IDS, CERT_IDS, RESERVED_IDS, type Product } from "@/lib/products";
import aryomKoruImage from "@/assets/aryom-koru.jpg";
import heroSut from "@/assets/hero-sut.jpg";
import heroKasa from "@/assets/hero-kasa.jpg";
import heroCips from "@/assets/hero-cips.jpg";
import cigKofteImage from "@/assets/cig-kofte.jpg";
import certMarka from "@/assets/certs/marka-tescil.jpg";
import certIso from "@/assets/certs/iso-22000.jpg";
import certHijyen from "@/assets/certs/hijyen-belgesi.jpg";
import certHelal from "@/assets/certs/helal-belgesi.jpg";
import certTavsiye from "@/assets/certs/tavsiye-sertifikasi.jpg";

const WHATSAPP_NUMBER = "905324556076";
const MARKET_NAME = "Aryom Market";

// ---- Üst kayan görsel (hero slider) ----
// İlk 3 görsel için varsayılan fotoğraflar hazır gelir. 4. ve 5. görseller admin panelinden
// yüklenmeden önce hiç gösterilmez — yüklenince otomatik olarak sıraya eklenir.
const DEFAULT_HERO_FALLBACK: ({ image: string; title: string; subtitle: string } | null)[] = [
  { image: heroSut, title: "Taze Süt & Süt Ürünleri", subtitle: "Her gün taze, kapınıza kadar" },
  { image: heroKasa, title: "Hızlı ve Güler Yüzlü Hizmet", subtitle: "Siparişiniz dakikalar içinde hazır" },
  { image: heroCips, title: "Geniş Atıştırmalık Reyonu", subtitle: "Aradığınız her marka burada" },
  null,
  null,
];

function HeroSlider({ slides }: { slides: { image: string; title: string; subtitle: string }[] }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="relative mx-auto mt-4 h-[190px] w-full max-w-[1600px] overflow-hidden rounded-2xl sm:h-[240px] lg:h-[280px]">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={s.image} alt={s.title} className="h-full w-full object-cover brightness-[0.82]" />
          <div className="absolute bottom-5 left-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <div className="font-display text-xl sm:text-2xl font-bold">{s.title}</div>
            <div className="mt-1 text-xs sm:text-sm opacity-95">{s.subtitle}</div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 right-5 flex gap-2">
        {slides.map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

// ---- Sertifikalı ürün tanıtım kutusu (sağ üstte, "X ürün listeleniyor" hizasında) ----
// Bu kutunun foto/video içeriği artık Yönetici Paneli'nden (Tanıtım Kutusu bölümü) yönetiliyor.
// Panelden hiçbir şey yüklenmemişse aşağıdaki varsayılan fotoğraf gösterilir.
type PromoMedia = { type: "image"; src: string } | { type: "video"; src: string };
const DEFAULT_PROMO_MEDIA: PromoMedia = { type: "image", src: cigKofteImage };

const DEFAULT_CERT_DOCS = [
  { src: certMarka, label: "Marka Tescil Belgesi" },
  { src: certIso, label: "ISO 22000:2018" },
  { src: certHijyen, label: "Hijyen Belgesi" },
  { src: certHelal, label: "Helal Belgesi" },
  { src: certTavsiye, label: "Tüketici Tavsiye Sertifikası" },
];

function CertifiedProductBox({ media, title, showCerts, onOpen }: { media: PromoMedia; title: string; showCerts: boolean; onOpen: () => void }) {
  const Wrapper = showCerts ? "button" : "div";
  return (
    <Wrapper
      onClick={showCerts ? onOpen : undefined}
      className={`group relative h-[276px] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-soft)] transition sm:h-[276px] sm:w-[250px] ${showCerts ? "hover:-translate-y-0.5" : ""}`}
    >
      <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[var(--orange)] px-2.5 py-1 text-[10px] font-bold text-white shadow-[var(--shadow-orange)]">
        YENİ ÜRÜN
      </span>
      {media.type === "video" ? (
        <video
          src={media.src}
          className="h-[62%] w-full object-cover bg-black"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img src={media.src} alt="Ürün" className="h-[62%] w-full object-contain bg-white p-2" loading="lazy" />
      )}
      <div className="px-3.5 pb-3 pt-2">
        <h4 className="font-display text-[13.5px] leading-tight text-foreground">{title}</h4>
        {showCerts && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[8.5px] font-bold text-blue-600">✓ ISO 22000</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-600">✓ Helal</span>
            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-600">✓ Hijyen</span>
          </div>
        )}
        {showCerts && (
          <div className="mt-2 flex justify-end">
            <span className="rounded-full bg-black/55 px-2 py-1 text-[8.5px] font-medium text-white">
              Belgeleri gör →
            </span>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function CertModal({ open, onClose, docs }: { open: boolean; onClose: () => void; docs: { src: string; label: string }[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-5" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-lg text-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Resmi Belgeler
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Büyütmek için görsele tıklayın.</div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {docs.map((c, i) => (
            <button
              key={i}
              onClick={() => setLightbox(c.src)}
              className="overflow-hidden rounded-xl border border-border text-left"
            >
              <img src={c.src} alt={c.label} className="h-32 w-full object-cover" loading="lazy" />
              <div className="px-2 py-2 text-center text-[11px] font-semibold text-foreground">{c.label}</div>
            </button>
          ))}
        </div>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-5"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(null);
          }}
        >
          <img src={lightbox} alt="Belge" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}

// ---- Mobil alt navigasyon çubuğu (Anasayfa / Kategoriler / Favoriler / Sepetim) ----
function BottomNav({
  itemCount,
  favCount,
  activeCat,
  onHome,
  onCategories,
  onFavorites,
  onCart,
}: {
  itemCount: number;
  favCount: number;
  activeCat: string;
  onHome: () => void;
  onCategories: () => void;
  onFavorites: () => void;
  onCart: () => void;
}) {
  const items = [
    { key: "home", label: "Anasayfa", icon: Home, onClick: onHome, active: false, badge: 0 },
    { key: "cats", label: "Kategoriler", icon: LayoutGrid, onClick: onCategories, active: false, badge: 0 },
    { key: "favs", label: "Favorilerim", icon: Heart, onClick: onFavorites, active: activeCat === "favs", badge: favCount },
    { key: "cart", label: "Sepetim", icon: ShoppingBag, onClick: onCart, active: false, badge: itemCount },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-[1600px] items-center justify-around px-2 py-1.5" style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              onClick={it.onClick}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors ${
                it.active ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={it.active ? 2.2 : 1.8}
                  fill={it.key === "favs" && it.active ? "currentColor" : "none"}
                />
                {it.badge > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-[var(--orange)] text-[9px] font-bold text-white">
                    {it.badge > 9 ? "9+" : it.badge}
                  </span>
                )}
              </span>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function IndexPage() {
  const rawProducts = useProducts();
  const products = useMemo(() => rawProducts.filter((p) => !RESERVED_IDS.includes(p.id)), [rawProducts]);
  const promoItem = useMemo(() => rawProducts.find((p) => p.id === PROMO_ID), [rawProducts]);
  const promoMedia: PromoMedia = useMemo(() => {
    if (promoItem && promoItem.image) {
      return { type: promoItem.category === "promo-video" ? "video" : "image", src: promoItem.image };
    }
    return DEFAULT_PROMO_MEDIA;
  }, [promoItem]);
  const promoTitle = promoItem?.name?.trim() || "Battalbey Çiğ Köfte";
  // Belgeleri gösterme ayarı, admin panelindeki onay kutusuyla kontrol edilir (price alanı 0/1 olarak kullanılıyor).
  const showCerts = promoItem ? promoItem.price !== 0 : true;

  const certDocs = useMemo(() => {
    return CERT_IDS.map((id, i) => {
      const item = rawProducts.find((p) => p.id === id);
      const fallback = DEFAULT_CERT_DOCS[i];
      if (item && item.image) {
        return { src: item.image, label: item.name || fallback.label };
      }
      return fallback;
    });
  }, [rawProducts]);

  const heroSlides = useMemo(() => {
    return HERO_IDS.map((id, i) => {
      const item = rawProducts.find((p) => p.id === id);
      const fallback = DEFAULT_HERO_FALLBACK[i];
      if (item && item.image) {
        return {
          image: item.image,
          title: item.name || fallback?.title || "",
          subtitle: item.unit || fallback?.subtitle || "",
        };
      }
      return fallback;
    }).filter((s): s is { image: string; title: string; subtitle: string } => s !== null);
  }, [rawProducts]);
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

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
  const CUSTOMER_INFO_KEY = "aryom_customer_info_v1";
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_INFO_KEY) || "{}");
      return {
        name: saved.name || "",
        phone: "",
        apartmentCode: saved.apartmentCode || "",
        payment: (saved.payment === "nakit" ? "nakit" : "kart") as "kart" | "nakit",
        note: "",
      };
    } catch {
      return { name: "", phone: "", apartmentCode: "", payment: "kart" as "kart" | "nakit", note: "" };
    }
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

  const add = (id: string) =>
    setCart((c) => {
      const product = products.find((p) => p.id === id);
      const current = c[id] || 0;
      // Stok tanımlıysa (bir sayıysa), sepete o stoktan fazla eklenemez.
      if (product && typeof product.stock === "number" && current >= product.stock) {
        return c;
      }
      return { ...c, [id]: current + 1 };
    });
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
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-10">
          <div className="flex items-center justify-between gap-3 lg:contents">
            <div className="flex min-w-0 shrink items-center gap-3 lg:order-1 lg:shrink-0">
              <div className="shrink-0 overflow-hidden rounded-md border border-[#0b3d2e]/70 shadow-soft" style={{ width: "clamp(48px, 6vw, 72px)" }}>
                <img
                  src={aryomKoruImage}
                  alt="Aryom Koru 1. Etap"
                  loading="lazy"
                  className="block aspect-square w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold uppercase leading-none tracking-tight text-[#0b3d2e] flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-lg">ARYOM KORU</span>
                  <span className="text-2xl sm:text-3xl">1.</span>
                  <span className="text-lg sm:text-lg text-[#0b3d2e]">ETAP</span>
                </div>
                <div className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b3d2e]/70 sm:text-[10px] sm:font-normal sm:tracking-[0.22em] sm:text-muted-foreground">
                  Sakinlere Özel Market
                </div>
              </div>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Sepeti aç"
              className="relative hidden shrink-0 flex-col items-start gap-0.5 rounded-2xl border border-border bg-card px-4 py-2 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-soft)] lg:order-3 lg:flex lg:px-5 lg:py-2.5"
            >
              <span className="flex items-center gap-2">
                <span className="relative">
                  <ShoppingBag className="h-5 w-5 text-foreground" strokeWidth={1.8} />
                  {itemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--orange)] text-[9px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-foreground">Sepetim</span>
              </span>
              <span className="text-sm font-bold text-[var(--orange)]">₺{total.toFixed(2)}</span>
            </button>
          </div>

          <div className="relative lg:order-2 lg:flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün, marka veya kategori arayın…"
              className="h-12 w-full rounded-full border border-border bg-secondary/50 pl-14 pr-6 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-gold/60 focus:bg-card focus:ring-4 focus:ring-gold/10 lg:h-14"
            />
          </div>
        </div>
      </header>

      {/* Üst kayan görsel */}
      <HeroSlider slides={heroSlides} />

      {/* Body layout */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-8">
        {/* Sidebar categories — sadece masaüstünde görünür, telefonda yatay şerit zaten var */}
        <aside className="hidden lg:block lg:sticky lg:top-28 lg:h-fit">
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
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="hidden text-[11px] uppercase tracking-[0.22em] text-gold lg:block">
                Aryom Market · Rezidans 168
              </div>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Sepeti aç"
                className="relative inline-flex flex-col items-start gap-0.5 rounded-2xl border border-border bg-card px-3.5 py-2 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-soft)] lg:hidden"
              >
                <span className="flex items-center gap-1.5">
                  <span className="relative">
                    <ShoppingBag className="h-4 w-4 text-foreground" strokeWidth={1.8} />
                    {itemCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--orange)] text-[8px] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-semibold text-foreground">Sepetim</span>
                </span>
                {itemCount > 0 && (
                  <span className="text-xs font-bold text-[var(--orange)]">₺{total.toFixed(2)}</span>
                )}
              </button>
              <h1 className="mt-1.5 font-display text-3xl leading-tight text-foreground">
                {categories.find((c) => c.id === activeCat)?.name ?? "Tümü"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sakinlerimize özel, kapınıza teslim seçkin ürünler.
              </p>
              <span className="mt-2 block text-sm text-muted-foreground">
                {filtered.length} ürün listeleniyor
              </span>
            </div>
            <CertifiedProductBox media={promoMedia} title={promoTitle} showCerts={showCerts} onOpen={() => setCertModalOpen(true)} />
          </div>

          <div id="kategoriler-alani" className="mb-6 flex gap-2 overflow-x-auto pb-2 scroll-mt-24">
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
              className="mb-6 hidden w-full items-center justify-between overflow-hidden rounded-xl border-l-4 border-l-[var(--orange)] border border-border bg-card px-6 py-5 text-left transition hover:shadow-[var(--shadow-soft)] lg:flex"
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
                const stockLimited = typeof p.stock === "number";
                const reachedLimit = stockLimited && qty >= (p.stock as number);
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
                      <div className={`absolute ${isFirsat ? "left-2 top-7" : "left-2 top-2"} z-10 rounded-full bg-[var(--orange)] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white`}>
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
                    <div className="h-48 overflow-hidden rounded-lg bg-[#f7f7f7] ring-1 ring-border">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <span className="text-5xl">{p.emoji}</span>
                        </div>
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
                            <div className="text-lg font-bold leading-none tracking-tight text-[var(--orange)]">₺{effectivePrice(p).toFixed(2)}</div>
                          </>
                        ) : (
                          <div className="text-lg font-bold leading-none tracking-tight text-gold">₺{p.price.toFixed(2)}</div>
                        )}
                        <div className="mt-0.5 text-[10px] text-muted-foreground">/ {p.unit}</div>
                        {stockLimited && (
                          reachedLimit ? (
                            <div className="mt-0.5 text-[10px] font-bold text-[var(--orange)]">Tükendi</div>
                          ) : (
                            <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                              Stokta {Math.max((p.stock as number) - qty, 0)} adet
                            </div>
                          )
                        )}
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
                          <button
                            onClick={() => add(p.id)}
                            disabled={reachedLimit}
                            className="grid h-7 w-7 place-items-center rounded-full text-gold transition hover:bg-gold hover:text-gold-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold"
                          >
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
              <ul className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
                {cartItems.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-[var(--shadow-card)]"
                  >
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/60 text-2xl">
                      {i.image ? (
                        <img src={i.image} alt={i.name} loading="lazy" className="h-full w-full object-contain p-1.5" />
                      ) : (
                        i.emoji
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {i.name}
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-1.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-[var(--orange)]">₺{effectivePrice(i).toFixed(2)}</span>
                        <span>/ {i.unit}</span>
                        {discountPercent(i) > 0 && (
                          <span className="text-muted-foreground/70 line-through">₺{i.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-0.5">
                          <button
                            onClick={() => dec(i.id)}
                            className="grid h-7 w-7 place-items-center rounded-full text-foreground transition hover:bg-card"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-bold text-foreground">
                            {i.qty}
                          </span>
                          <button
                            onClick={() => add(i.id)}
                            className="grid h-7 w-7 place-items-center rounded-full text-foreground transition hover:bg-card"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            ₺{(effectivePrice(i) * i.qty).toFixed(2)}
                          </span>
                          <button
                            onClick={() => remove(i.id)}
                            aria-label="Kaldır"
                            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border bg-gradient-to-b from-transparent to-secondary/40 px-6 py-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ara toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Teslimat</span>
                  <span className="text-gold">Ücretsiz</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="font-display text-lg text-foreground">Toplam</span>
                  <span className="font-display text-2xl text-foreground">
                    ₺{total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.52_0.18_150)] py-4 text-base font-semibold tracking-wide text-gold-foreground shadow-[0_12px_30px_-10px_var(--gold)] transition hover:scale-[1.02] hover:shadow-[0_16px_36px_-8px_var(--gold)]"
                >
                  Siparişi Tamamla →
                </button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Rezidans içi teslimat · 60 dakika
                </p>
              </div>
            </>
          )}
        </aside>
      </div>

      <CertModal open={certModalOpen} onClose={() => setCertModalOpen(false)} docs={certDocs} />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        form={form}
        setForm={setForm}
        cartItems={cartItems}
        total={total}
        onSuccess={() => {
          try {
            localStorage.setItem(
              CUSTOMER_INFO_KEY,
              JSON.stringify({ name: form.name, apartmentCode: form.apartmentCode, payment: form.payment })
            );
          } catch {}
          setCart({});
          setCheckoutOpen(false);
        }}
      />

      <BottomNav
        itemCount={itemCount}
        favCount={favorites.size}
        activeCat={activeCat}
        onHome={() => {
          setActiveCat("all");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCategories={() => {
          document.getElementById("kategoriler-alani")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onFavorites={() => {
          setActiveCat("favs");
          document.getElementById("kategoriler-alani")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onCart={() => setCartOpen(true)}
      />

      <footer className="mx-auto max-w-[1600px] px-6 py-10 text-center text-xs text-muted-foreground lg:px-10">
        <div className="flex flex-col items-center gap-3">
          <div className="font-display text-base text-foreground">{MARKET_NAME}</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground">
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> +90 532 455 60 76
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-gold">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> WhatsApp Sipariş Hattı
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Rezidans 168 · {MARKET_NAME}</span>
            <span className="text-muted-foreground/40">·</span>
            <Link to="/admin" className="inline-flex items-center gap-1 text-muted-foreground/70 transition hover:text-gold">
              <Lock className="h-3 w-3" strokeWidth={1.5} /> Yönetici Girişi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

type CheckoutForm = {
  name: string;
  phone: string;
  apartmentCode: string;
  payment: "kart" | "nakit";
  note: string;
};

type CartLine = Product & { qty: number };

function CheckoutModal({
  open,
  onClose,
  form,
  setForm,
  cartItems,
  total,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  form: CheckoutForm;
  setForm: React.Dispatch<React.SetStateAction<CheckoutForm>>;
  cartItems: CartLine[];
  total: number;
  onSuccess: () => void;
}) {
  if (!open) return null;

  const canSubmit =
    form.name.trim().length > 1 &&
    form.apartmentCode.trim().length > 0 &&
    cartItems.length > 0;

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push(`*${MARKET_NAME} — Yeni Sipariş*`);
    lines.push("");
    lines.push(`👤 Ad Soyad: ${form.name}`);
    lines.push(`🏢 Daire Kodu: ${form.apartmentCode}`);
    lines.push(
      `💳 Ödeme: ${form.payment === "kart" ? "Kapıda Kredi Kartı" : "Kapıda Nakit"}`
    );
    if (form.note.trim()) lines.push(`📝 Not: ${form.note.trim()}`);
    lines.push("");
    lines.push("*Sipariş Detayı*");
    cartItems.forEach((i) => {
      lines.push(
        `• ${i.name} × ${i.qty} — ₺${(effectivePrice(i) * i.qty).toFixed(2)}`
      );
    });
    lines.push("");
    lines.push(`*Toplam: ₺${total.toFixed(2)}*`);
    lines.push(`Teslimat: Ücretsiz (Rezidans içi)`);
    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const text = encodeURIComponent(buildMessage());
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    onSuccess();
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-border bg-gradient-to-br from-secondary/60 to-transparent px-6 py-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Sipariş Onayı
            </div>
            <div className="mt-1 font-display text-2xl text-foreground">
              {MARKET_NAME}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Sipariş bilgilerinizi doldurun, WhatsApp üzerinden bize iletelim.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <Field label="Ad Soyad" icon={<User className="h-4 w-4" strokeWidth={1.5} />}>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Adınız ve soyadınız"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                required
              />
            </Field>
            <a
              href="https://whatsapp.com/channel/0029Vb8MyAo1NCrT8QtL6F44"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-secondary/40 to-transparent px-3 py-2 transition hover:border-gold hover:shadow-md"
            >
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=https%3A%2F%2Fwhatsapp.com%2Fchannel%2F0029Vb8MyAo1NCrT8QtL6F44"
                alt="Haftalık indirimli WhatsApp grubu QR kodu"
                className="h-14 w-14 shrink-0 rounded-md bg-white p-1 ring-1 ring-border"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold">
                  Ayrıcalıklı Kanal
                </div>
                <div className="mt-0.5 font-display text-[15px] leading-tight text-foreground">
                  Haftalık İndirimli
                  <br />
                  WhatsApp Grubumuz
                </div>
                <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                  Katılmak için QR kodu okutun
                </div>
              </div>
            </a>
            <Field
              label="Daire Kodu"
              icon={<KeyRound className="h-4 w-4" strokeWidth={1.5} />}
              hint="Rezidansın size verdiği daire kodu"
            >
              <input
                value={form.apartmentCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apartmentCode: e.target.value.toUpperCase() }))
                }
                placeholder="Örn. A-1204"
                className="w-full bg-transparent text-sm tracking-wider text-foreground outline-none placeholder:text-muted-foreground/60"
                required
              />
            </Field>
            <Field label="Not (opsiyonel)" icon={<MessageCircle className="h-4 w-4" strokeWidth={1.5} />}>
              <input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Kapıya bırakın, zili çalmayın…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
          </div>

          <div className="px-6 pb-2">
            <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Ödeme Yöntemi
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                active={form.payment === "kart"}
                onClick={() => setForm((f) => ({ ...f, payment: "kart" }))}
                icon={<CreditCard className="h-5 w-5" strokeWidth={1.5} />}
                title="Kapıda Kredi Kartı"
                desc="Teslimatta POS ile ödeme"
              />
              <PaymentOption
                active={form.payment === "nakit"}
                onClick={() => setForm((f) => ({ ...f, payment: "nakit" }))}
                icon={<Wallet className="h-5 w-5" strokeWidth={1.5} />}
                title="Kapıda Nakit"
                desc="Teslimatta nakit ödeme"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-border bg-secondary/30 px-6 py-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Sepet Özeti
            </div>
            <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {cartItems.map((i) => (
                <li key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-2.5 py-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-card text-lg">
                    {i.image ? (
                      <img src={i.image} alt={i.name} loading="lazy" className="h-full w-full object-contain p-1" />
                    ) : (
                      i.emoji
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground/90">
                    {i.name} <span className="text-muted-foreground">× {i.qty}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">₺{(effectivePrice(i) * i.qty).toFixed(2)}</span>
                </li>
              ))}
              {cartItems.length === 0 && (
                <li className="text-sm text-muted-foreground">Sepetiniz boş.</li>
              )}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <span className="font-display text-base text-foreground">Toplam</span>
              <span className="font-display text-xl text-foreground">₺{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium tracking-wide text-background transition hover:bg-gold hover:text-gold-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-foreground disabled:hover:text-background"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
              WhatsApp ile Siparişi Onayla
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Onayladığınızda sipariş bilgileriniz {MARKET_NAME} WhatsApp hattına iletilir.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-3 transition focus-within:border-gold/60 focus-within:ring-4 focus-within:ring-gold/10">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground/80">{hint}</div>}
    </label>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? "border-gold/60 bg-gradient-to-br from-gold/15 to-transparent shadow-[0_4px_20px_-8px_var(--gold)]"
          : "border-border bg-background hover:border-border/80 hover:bg-secondary/40"
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${active ? "bg-gold/20 text-gold" : "bg-secondary text-foreground"}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`ml-auto h-3 w-3 shrink-0 rounded-full border-2 ${
          active ? "border-gold bg-gold" : "border-border"
        }`}
      />
    </button>
  );
}
