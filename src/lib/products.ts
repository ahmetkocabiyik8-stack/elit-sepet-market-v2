import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantı bilgileri
export const SUPABASE_URL = "https://pvafbevygaqeuuyaknnz.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable__pusJGKzNfSOKcRM3z8gzA_GFk3nyJ7";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  unit: string;
  emoji: string;
  image?: string;
  // Stok takibi: tanımsız/boş (undefined) ise stok takibi yapılmaz, ürün her zaman görünür.
  // Bir sayı girilirse (örn. 15), o kadar stok olduğu varsayılır. 0'a düşünce ürün ana sayfada gizlenir.
  stock?: number;
};

export function effectivePrice(p: Product): number {
  return typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price
    ? p.salePrice
    : p.price;
}

// Stok takip ediliyorsa (stock bir sayıysa) ve 0 veya altındaysa ürün stokta yok demektir.
export function isOutOfStock(p: Product): boolean {
  return typeof p.stock === "number" && p.stock <= 0;
}

export function discountPercent(p: Product): number {
  if (typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price) {
    return Math.round(((p.price - p.salePrice) / p.price) * 100);
  }
  return 0;
}

export const ADMIN_PIN = "168168";

// Özel/rezerve ürün kimlikleri: bunlar normal ürün listesinde GÖRÜNMEZ,
// admin panelindeki "Tanıtım Kutusu" ve "Üst Banner (Kayan Görsel)" bölümlerini yönetmek için kullanılır.
export const PROMO_ID = "__promo__";
export const HERO_IDS = ["__hero_1__", "__hero_2__", "__hero_3__", "__hero_4__", "__hero_5__"] as const;
export const CERT_IDS = ["__cert_1__", "__cert_2__", "__cert_3__", "__cert_4__", "__cert_5__"] as const;
export const RESERVED_IDS: string[] = [PROMO_ID, ...HERO_IDS, ...CERT_IDS];

export const categories = [
  { id: "all", name: "Tümü" },
  { id: "firsat", name: "Haftanın Fırsat Ürünleri" },
  { id: "gida", name: "Gıda" },
  { id: "sut", name: "Süt Ürünleri" },
  { id: "icecek", name: "İçecek" },
  { id: "temizlik", name: "Temizlik" },
  { id: "kisisel", name: "Kişisel Bakım" },
  { id: "atistirmalik", name: "Atıştırmalık" },
  { id: "kahvalti", name: "Kahvaltılık" },
];

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  sale_price: number | null;
  unit: string;
  emoji: string;
  image_url: string | null;
  stock: number | null;
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    price: Number(r.price) || 0,
    salePrice: r.sale_price != null ? Number(r.sale_price) : undefined,
    unit: r.unit,
    emoji: r.emoji,
    image: r.image_url || undefined,
    stock: r.stock != null ? Number(r.stock) : undefined,
  };
}

function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    sale_price: p.salePrice ?? null,
    unit: p.unit,
    emoji: p.emoji,
    image_url: p.image || null,
    stock: p.stock ?? null,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as ProductRow[]).map(rowToProduct);
}

export async function saveProducts(list: Product[]): Promise<{ ok: boolean; message?: string }> {
  if (!list.length) return { ok: true };
  const { error } = await supabase.from("products").upsert(list.map(productToRow));
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function uploadProductImage(id: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${id}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export function notifyProductsUpdated() {
  window.dispatchEvent(new Event("aryom-products-updated"));
}

export function useProducts(): Product[] {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchProducts();
      if (!cancelled) setItems(data);
    };
    load();
    window.addEventListener("aryom-products-updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("aryom-products-updated", load);
    };
  }, []);
  return items;
}
