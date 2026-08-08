import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Plus, Trash2, Upload, Lock, LogOut, ImagePlus, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import {
  ADMIN_PIN,
  categories,
  fetchProducts,
  saveProducts,
  deleteProduct,
  uploadProductImage,
  notifyProductsUpdated,
  PROMO_ID,
  HERO_IDS,
  CERT_IDS,
  type Product,
} from "@/lib/products";

const HERO_LABELS = ["1. Görsel", "2. Görsel", "3. Görsel", "4. Görsel (opsiyonel)", "5. Görsel (opsiyonel)"];
const CERT_LABELS = ["1. Belge", "2. Belge", "3. Belge", "4. Belge", "5. Belge"];

const AUTH_KEY = "aryom_admin_authed_v1";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  if (!authed) return <PinGate onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("Şifre 6 haneli olmalıdır.");
      return;
    }
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError("Şifre hatalı. Lütfen tekrar deneyin.");
      setPin("");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)]">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Ana Sayfaya Dön
        </Link>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-gold/10">
            <Lock className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Aryom Market</div>
            <div className="font-display text-2xl text-foreground">Yönetici Girişi</div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">6 Haneli Şifre</div>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-4 text-center text-2xl tracking-[0.6em] text-foreground outline-none transition focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
            />
          </label>
          {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-full bg-foreground py-3.5 text-sm font-medium tracking-wide text-background transition hover:bg-gold hover:text-gold-foreground"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

type Draft = Product & { isNew?: boolean };

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const list = await fetchProducts();
      setDrafts(list);
      setLoading(false);
    })();
  }, []);

  const update = (id: string, patch: Partial<Draft>) => {
    setDrafts((d) => d.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleFile = async (id: string, file: File) => {
    setUploadingId(id);
    const url = await uploadProductImage(id, file);
    if (url) update(id, { image: url });
    else setErrorMsg("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.");
    setUploadingId(null);
  };

  // ---- Tanıtım Kutusu (Ana sayfa sağ üstteki foto/video kutusu) ----
  const promoDraft = drafts.find((d) => d.id === PROMO_ID);
  const promoType: "image" | "video" = promoDraft?.category === "promo-video" ? "video" : "image";
  // showCerts: promoDraft henüz yoksa (ilk kurulum) varsayılan olarak AÇIK kabul edilir.
  const promoShowCerts = promoDraft ? promoDraft.price !== 0 : true;

  const ensurePromoDraft = (patch: Partial<Draft> = {}) => {
    setDrafts((d) => {
      const exists = d.some((p) => p.id === PROMO_ID);
      if (exists) return d.map((p) => (p.id === PROMO_ID ? { ...p, ...patch } : p));
      return [
        ...d,
        { id: PROMO_ID, name: "Battalbey Çiğ Köfte", category: "promo-image", price: 1, unit: "-", emoji: "🎬", ...patch },
      ];
    });
  };

  const setPromoType = (type: "image" | "video") => {
    ensurePromoDraft({ category: type === "video" ? "promo-video" : "promo-image" });
  };

  const setPromoTitle = (name: string) => {
    ensurePromoDraft({ name });
  };

  const setPromoShowCerts = (show: boolean) => {
    ensurePromoDraft({ price: show ? 1 : 0 });
  };

  const handlePromoFile = async (file: File) => {
    const detectedType: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    setUploadingId(PROMO_ID);
    const url = await uploadProductImage(PROMO_ID, file);
    setUploadingId(null);
    if (!url) {
      setErrorMsg("Dosya yüklenemedi. Lütfen tekrar deneyin.");
      return;
    }
    ensurePromoDraft({ category: detectedType === "video" ? "promo-video" : "promo-image", image: url });
  };

  // ---- Belgeler (Tanıtım Kutusu'ndaki "Belgeleri gör" penceresinde çıkan sertifikalar) ----
  const getCertDraft = (id: string) => drafts.find((d) => d.id === id);

  const updateCertField = (id: string, patch: Partial<Draft>) => {
    setDrafts((d) => {
      const exists = d.some((p) => p.id === id);
      if (exists) return d.map((p) => (p.id === id ? { ...p, ...patch } : p));
      return [
        ...d,
        { id, name: "", category: "cert", price: 0, unit: "", emoji: "📄", ...patch },
      ];
    });
  };

  const handleCertFile = async (id: string, file: File) => {
    setUploadingId(id);
    const url = await uploadProductImage(id, file);
    setUploadingId(null);
    if (!url) {
      setErrorMsg("Belge yüklenemedi. Lütfen tekrar deneyin.");
      return;
    }
    updateCertField(id, { image: url });
  };

  // ---- Üst Banner (Ana sayfanın en üstünde kayan 3 görsel) ----
  const getHeroDraft = (id: string) => drafts.find((d) => d.id === id);

  const updateHeroField = (id: string, patch: Partial<Draft>) => {
    setDrafts((d) => {
      const exists = d.some((p) => p.id === id);
      if (exists) return d.map((p) => (p.id === id ? { ...p, ...patch } : p));
      return [
        ...d,
        { id, name: "", category: "hero", price: 0, unit: "", emoji: "🖼️", ...patch },
      ];
    });
  };

  const handleHeroFile = async (id: string, file: File) => {
    setUploadingId(id);
    const url = await uploadProductImage(id, file);
    setUploadingId(null);
    if (!url) {
      setErrorMsg("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.");
      return;
    }
    updateHeroField(id, { image: url });
  };

  const addProduct = (category: string = "firsat") => {
    const id = `custom-${Date.now()}`;
    const emoji = category === "firsat" ? "⭐" : "🛒";
    const name = category === "firsat" ? "Yeni Fırsat Ürünü" : "Yeni Ürün";
    setDrafts((d) => [
      ...d,
      { id, name, category, price: 0, unit: "adet", emoji, isNew: true },
    ]);
  };

  const removeProduct = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const isNewLocal = drafts.find((d) => d.id === id)?.isNew;
    if (!isNewLocal) {
      const res = await deleteProduct(id);
      if (!res.ok) {
        setErrorMsg(res.message || "Silme işlemi başarısız oldu.");
        return;
      }
    }
    setDrafts((d) => d.filter((p) => p.id !== id));
    notifyProductsUpdated();
  };

  const saveAll = async () => {
    setSaving(true);
    setErrorMsg("");
    const clean: Product[] = drafts.map(({ isNew: _isNew, ...rest }) => rest);
    const res = await saveProducts(clean);
    setSaving(false);
    if (!res.ok) {
      setErrorMsg(res.message || "Kaydetme sırasında bir hata oluştu.");
      return;
    }
    notifyProductsUpdated();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    onLogout();
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Ürünler yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-gold/60 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Aryom Market</div>
              <div className="font-display text-2xl text-foreground">Yönetici Paneli</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {savedFlash && <span className="text-xs text-gold">✓ Değişiklikler kaydedildi</span>}
            {errorMsg && <span className="text-xs text-destructive">{errorMsg}</span>}
            <button
              onClick={saveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🖼️</span>
              <div>
                <h2 className="font-display text-xl text-foreground">Üst Banner (Kayan Görseller)</h2>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ana sayfanın en üstünde dönen fotoğraflar · 2-5 arası görsel kullanabilirsiniz
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {HERO_IDS.map((id, i) => {
              const draft = getHeroDraft(id);
              return (
                <div key={id} className="rounded-xl border border-border bg-background p-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {HERO_LABELS[i]}
                  </div>
                  <label className="group relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary transition hover:border-gold/60">
                    {uploadingId === id ? (
                      <span className="text-[11px] text-muted-foreground">Yükleniyor...</span>
                    ) : draft?.image ? (
                      <img src={draft.image} alt={HERO_LABELS[i]} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {i < 3 ? "Varsayılan görsel kullanılıyor" : "Henüz görsel yok"}
                      </span>
                    )}
                    <div className="absolute inset-0 hidden items-center justify-center bg-foreground/60 text-background group-hover:flex">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleHeroFile(id, f);
                      }}
                    />
                  </label>
                  <input
                    value={draft?.name || ""}
                    onChange={(e) => updateHeroField(id, { name: e.target.value })}
                    placeholder="Başlık (opsiyonel)"
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold/60"
                  />
                  <input
                    value={draft?.unit || ""}
                    onChange={(e) => updateHeroField(id, { unit: e.target.value })}
                    placeholder="Alt yazı (opsiyonel)"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold/60"
                  />
                </div>
              );
            })}
          </div>
          <div className="border-t border-border bg-secondary/20 px-5 py-3 text-[11px] text-muted-foreground">
            Değişikliklerin ana sayfada görünmesi için en alttaki "Kaydet" butonuna basmayı unutmayın.
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-gold/50 bg-card shadow-[0_10px_40px_-20px_rgba(191,155,48,0.35)]">
          <div className="flex items-center justify-between border-b border-gold/30 bg-gold/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🎬</span>
              <div>
                <h2 className="font-display text-xl text-gold">Tanıtım Kutusu</h2>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ana sayfada sağ üstte görünen foto/video kutusu
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-start">
            {/* Önizleme */}
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
              {uploadingId === PROMO_ID ? (
                <div className="grid h-full w-full place-items-center text-[11px] text-muted-foreground">
                  Yükleniyor...
                </div>
              ) : promoDraft?.image ? (
                promoType === "video" ? (
                  <video src={promoDraft.image} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <img src={promoDraft.image} alt="Tanıtım" className="h-full w-full object-contain p-1" />
                )
              ) : (
                <div className="grid h-full w-full place-items-center text-[11px] text-muted-foreground">
                  Henüz medya yok
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* Urun adi */}
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ürün Adı (kutunun altında görünür)
                </div>
                <input
                  value={promoDraft?.name ?? "Battalbey Çiğ Köfte"}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Örn. Türk Kahvesi Makinesi"
                  className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-gold/60"
                />
              </div>

              {/* Foto / Video secimi */}
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">İçerik Türü</div>
                <div className="inline-flex rounded-full border border-border bg-background p-1">
                  <button
                    onClick={() => setPromoType("image")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${
                      promoType === "image" ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Fotoğraf
                  </button>
                  <button
                    onClick={() => setPromoType("video")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${
                      promoType === "video" ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <VideoIcon className="h-3.5 w-3.5" /> Video
                  </button>
                </div>
              </div>

              {/* Dosya yukleme */}
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Dosya Yükle</div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground transition hover:border-gold/60 hover:bg-gold/10">
                  <Upload className="h-3.5 w-3.5" />
                  {promoType === "video" ? "Video Seç" : "Fotoğraf Seç"}
                  <input
                    type="file"
                    accept={promoType === "video" ? "video/*" : "image/*"}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePromoFile(f);
                    }}
                  />
                </label>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Video dosyaları biraz zaman alabilir, lütfen yükleme bitene kadar bekleyin. Yükledikten sonra en alttaki
                  "Kaydet" butonuna basmayı unutmayın.
                </p>
              </div>

              {/* Belgeleri goster/gizle */}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={promoShowCerts}
                  onChange={(e) => setPromoShowCerts(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                <span className="text-xs text-foreground">
                  Belge/sertifika rozetlerini ve "Belgeleri gör" penceresini göster
                </span>
              </label>
              <p className="text-[11px] text-muted-foreground">
                Farklı bir ürüne (örn. kahve makinesi) geçerken, o ürünle ilgisi olmayan gıda sertifikalarının
                görünmesini istemiyorsan bu kutuyu kapatabilirsin.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">📄</span>
              <div>
                <h2 className="font-display text-xl text-foreground">Belgeler (Sertifikalar)</h2>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  "Belgeleri gör" penceresinde çıkan belgeler · her birini ayrı ayrı değiştirebilirsin
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {CERT_IDS.map((id, i) => {
              const draft = getCertDraft(id);
              return (
                <div key={id} className="rounded-xl border border-border bg-background p-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {CERT_LABELS[i]}
                  </div>
                  <label className="group relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary transition hover:border-gold/60">
                    {uploadingId === id ? (
                      <span className="text-[11px] text-muted-foreground">Yükleniyor...</span>
                    ) : draft?.image ? (
                      <img src={draft.image} alt={CERT_LABELS[i]} className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-2 text-center text-[11px] text-muted-foreground">
                        Varsayılan belge kullanılıyor
                      </span>
                    )}
                    <div className="absolute inset-0 hidden items-center justify-center bg-foreground/60 text-background group-hover:flex">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCertFile(id, f);
                      }}
                    />
                  </label>
                  <input
                    value={draft?.name || ""}
                    onChange={(e) => updateCertField(id, { name: e.target.value })}
                    placeholder="Belge adı (opsiyonel)"
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold/60"
                  />
                </div>
              );
            })}
          </div>
          <div className="border-t border-border bg-secondary/20 px-5 py-3 text-[11px] text-muted-foreground">
            Değişikliklerin görünmesi için en alttaki "Kaydet" butonuna basmayı unutmayın.
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground">Ürün Yönetimi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ürünler kategoriye göre gruplanmıştır. Her kategoriye ayrı ürün ekleyebilirsiniz.
            </p>
          </div>
          <button
            onClick={() => addProduct("firsat")}
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-gold hover:text-gold-foreground"
          >
            <Plus className="h-4 w-4" /> Fırsat Ürünü Ekle
          </button>
        </div>

        <div className="space-y-8">
          {categories.filter((c) => c.id !== "all").map((cat) => {
            const rows = drafts.filter((d) => d.category === cat.id);
            const isFirsat = cat.id === "firsat";
            return (
              <section
                key={cat.id}
                className={`overflow-hidden rounded-2xl border bg-card ${isFirsat ? "border-gold/50 shadow-[0_10px_40px_-20px_rgba(191,155,48,0.35)]" : "border-border"}`}
              >
                <div className={`flex items-center justify-between border-b px-5 py-4 ${isFirsat ? "border-gold/30 bg-gold/5" : "border-border bg-secondary/30"}`}>
                  <div className="flex items-center gap-3">
                    {isFirsat && <span className="text-lg">⭐</span>}
                    <div>
                      <h2 className={`font-display text-xl ${isFirsat ? "text-gold" : "text-foreground"}`}>{cat.name}</h2>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{rows.length} ürün</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addProduct(cat.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-gold/60 hover:bg-gold/10"
                  >
                    <Plus className="h-3.5 w-3.5" /> Bu Kategoriye Ekle
                  </button>
                </div>

                {rows.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Bu kategoride henüz ürün yok. Yukarıdaki "Bu Kategoriye Ekle" butonunu kullanın.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Fotoğraf</th>
                        <th className="px-4 py-3">Ürün Adı</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Normal Fiyat (₺)</th>
                        <th className="px-4 py-3">İndirimli Fiyat (₺)</th>
                        <th className="px-4 py-3">İndirim</th>
                        <th className="px-4 py-3">Birim</th>
                        <th className="px-4 py-3">Stok</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((p) => (
                        <tr key={p.id} className="align-middle">
                          <td className="px-4 py-3">
                            <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary transition hover:border-gold/60">
                              {uploadingId === p.id ? (
                                <span className="text-[10px] text-muted-foreground">Yükleniyor...</span>
                              ) : p.image ? (
                                <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />
                              ) : (
                                <span className="text-2xl">{p.emoji}</span>
                              )}
                              <div className="absolute inset-0 hidden items-center justify-center bg-foreground/60 text-background group-hover:flex">
                                <ImagePlus className="h-5 w-5" />
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFile(p.id, f);
                                }}
                              />
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={p.name}
                              onChange={(e) => update(p.id, { name: e.target.value })}
                              className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-foreground transition hover:border-border focus:border-gold/60 focus:bg-background focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={p.category}
                              onChange={(e) => update(p.id, { category: e.target.value })}
                              className="rounded-lg border border-border bg-background px-2 py-1.5 text-foreground outline-none focus:border-gold/60"
                            >
                              {categories.filter((c) => c.id !== "all").map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={p.price}
                              onChange={(e) => update(p.id, { price: parseFloat(e.target.value) || 0 })}
                              className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-right tabular-nums text-foreground outline-none focus:border-gold/60"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={p.salePrice ?? ""}
                              placeholder="—"
                              onChange={(e) => {
                                const v = e.target.value;
                                update(p.id, { salePrice: v === "" ? undefined : (parseFloat(v) || 0) });
                              }}
                              className="w-28 rounded-lg border border-gold/40 bg-gold/5 px-2 py-1.5 text-right tabular-nums text-foreground outline-none focus:border-gold focus:bg-background"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const sp = p.salePrice;
                              if (typeof sp === "number" && sp > 0 && sp < p.price) {
                                const pct = Math.round(((p.price - sp) / p.price) * 100);
                                return (
                                  <span className="inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-foreground">
                                    %{pct}
                                  </span>
                                );
                              }
                              return <span className="text-xs text-muted-foreground">—</span>;
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={p.unit}
                              onChange={(e) => update(p.id, { unit: e.target.value })}
                              className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-foreground outline-none focus:border-gold/60"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              step="1"
                              value={p.stock ?? ""}
                              placeholder="Sınırsız"
                              onChange={(e) => {
                                const v = e.target.value;
                                update(p.id, { stock: v === "" ? undefined : Math.max(0, parseInt(v, 10) || 0) });
                              }}
                              className={`w-24 rounded-lg border px-2 py-1.5 text-right tabular-nums outline-none focus:border-gold/60 ${
                                typeof p.stock === "number" && p.stock <= 0
                                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                                  : "border-border bg-background text-foreground"
                              }`}
                            />
                            {typeof p.stock === "number" && p.stock <= 0 && (
                              <div className="mt-1 text-[10px] font-medium text-destructive">Tükendi</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeProduct(p.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <Upload className="h-3.5 w-3.5" /> Bilgi
          </div>
          Fotoğraflar tarayıcınızda güvenle saklanır. Değişikliklerinizi kaydetmeyi unutmayın; kaydettikten sonra ana sayfada anında görüntülenir.
        </div>
      </main>
    </div>
  );
}
