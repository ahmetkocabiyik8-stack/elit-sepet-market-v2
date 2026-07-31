import { useEffect, useState } from "react";
import sutasSutImg from "@/assets/sutas-sut.jpg";
import neskafeClassicImg from "@/assets/neskafe-classic.jpg";
import neskafeMochaImg from "@/assets/neskafe-mocha.jpg";
import neskafeCaramelImg from "@/assets/neskafe-caramel.jpg";

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
export const OVERRIDES_KEY = "aryom_admin_overrides_v1";
export const CUSTOM_PRODUCTS_KEY = "aryom_admin_custom_v1";

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

export const baseProducts: Product[] = [
  { id: "sutas-sut-1l", name: "Sütaş Süt 1L", category: "sut", price: 70, unit: "kutu", emoji: "🥛", image: sutasSutImg },
  { id: "neskafe-classic", name: "Soğuk Neskafe Classic", category: "icecek", price: 75, unit: "şişe", emoji: "☕", image: neskafeClassicImg },
  { id: "neskafe-mocha", name: "Soğuk Neskafe Mocha", category: "icecek", price: 75, unit: "şişe", emoji: "☕", image: neskafeMochaImg },
  { id: "neskafe-caramel", name: "Soğuk Neskafe Caramel", category: "icecek", price: 75, unit: "şişe", emoji: "☕", image: neskafeCaramelImg },
];

export type ProductOverride = Partial<Pick<Product, "name" | "price" | "salePrice" | "category" | "unit" | "image">>;

export function loadOverrides(): Record<string, ProductOverride> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveOverrides(o: Record<string, ProductOverride>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));
  window.dispatchEvent(new Event("aryom-products-updated"));
}

export function loadCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomProducts(list: Product[]) {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("aryom-products-updated"));
}

function merge(): Product[] {
  const overrides = loadOverrides();
  const withOverrides = baseProducts.map((p) => ({ ...p, ...overrides[p.id] }));
  return [...withOverrides, ...loadCustomProducts()];
}

export function useProducts(): Product[] {
  const [items, setItems] = useState<Product[]>(baseProducts);
  useEffect(() => {
    const update = () => setItems(merge());
    update();
    window.addEventListener("aryom-products-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("aryom-products-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return items;
}
