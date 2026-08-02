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
};

export function effectivePrice(p: Product): number {
  return typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price
    ? p.salePrice
    : p.price;
}

export function discountPercent(p: Product): number {
  if (typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price) {
    return Math.round(((p.price - p.salePrice) / p.price) * 100);
  }
  return 0;
}

export const ADMIN_PIN = "168168";

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
