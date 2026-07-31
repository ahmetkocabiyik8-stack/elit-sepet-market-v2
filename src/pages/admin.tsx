import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Plus, Trash2, Upload, Lock, LogOut, ImagePlus } from "lucide-react";
import {
  ADMIN_PIN,
  baseProducts,
  categories,
  loadCustomProducts,
  loadOverrides,
  saveCustomProducts,
  saveOverrides,
  type Product,
  type ProductOverride,
} from "@/lib/products";

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
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const overrides = loadOverrides();
    const base: Draft[] = baseProducts.map((p) => ({ ...p, ...overrides[p.id] }));
    const custom: Draft[] = loadCustomProducts();
    setDrafts([...base, ...custom]);
  }, []);

  const isBaseId = useMemo(() => new Set(baseProducts.map((p) => p.id)), []);

  const update = (id: string, patch: Partial<Draft>) => {
    setDrafts((d) => d.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => update(id, { image: reader.result as string });
    reader.readAsDataURL(file);
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

  const removeProduct = (id: string) => {
    if (isBaseId.has(id)) {
      if (!confirm("Bu ürün varsayılan üründür. Değişiklikleri sıfırlamak istediğinize emin misiniz?")) return;
      const base = baseProducts.find((p) => p.id === id)!;
      update(id, { ...base });
    } else {
      if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
      setDrafts((d) => d.filter((p) => p.id !== id));
    }
  };

  const saveAll = () => {
    const overrides: Record<string, ProductOverride> = {};
    const custom: Product[] = [];
    for (const d of drafts) {
      if (isBaseId.has(d.id)) {
        const base = baseProducts.find((p) => p.id === d.id)!;
        const diff: ProductOverride = {};
        (["name", "price", "salePrice", "category", "unit", "image"] as const).forEach((k) => {
          if (d[k] !== base[k]) (diff as Record<string, unknown>)[k] = d[k];
        });
        if (Object.keys(diff).length) overrides[d.id] = diff;
      } else {
        const { isNew: _isNew, ...rest } = d;
        custom.push(rest);
      }
    }
    saveOverrides(overrides);
    saveCustomProducts(custom);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    onLogout();
  };

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
            <button
              onClick={saveAll}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-gold hover:text-gold-foreground"
            >
              <Save className="h-4 w-4" /> Kaydet
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
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((p) => (
                        <tr key={p.id} className="align-middle">
                          <td className="px-4 py-3">
                            <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary transition hover:border-gold/60">
                              {p.image ? (
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
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeProduct(p.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                              title={isBaseId.has(p.id) ? "Varsayılana sıfırla" : "Sil"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isBaseId.has(p.id) ? "Sıfırla" : "Sil"}
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
