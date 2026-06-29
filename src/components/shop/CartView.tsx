"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hrefWithLang } from "@/lib/navigation";
import { formatStoreError, storeFetch } from "@/lib/store-client";
import { formatStorePrice, type WCCart } from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";

function productSlugFromPermalink(permalink: string): string {
  try {
    const parts = new URL(permalink).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return permalink.split("/").filter(Boolean).pop() ?? "";
  }
}

export function CartView({ lang }: { lang: WPLanguage }) {
  const [cart, setCart] = useState<WCCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeFetch<WCCart>("/api/store/cart");
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateQty(key: string, quantity: number) {
    try {
      const data = await storeFetch<WCCart>("/api/store/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", key, quantity }),
      });
      setCart(data);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      alert(
        formatStoreError(
          e instanceof Error ? e.message : lang === "th" ? "อัปเดตไม่สำเร็จ" : "Update failed",
        ),
      );
      await load();
    }
  }

  async function remove(key: string) {
    try {
      const data = await storeFetch<WCCart>("/api/store/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", key }),
      });
      setCart(data);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      alert(
        formatStoreError(
          e instanceof Error ? e.message : lang === "th" ? "ลบไม่สำเร็จ" : "Remove failed",
        ),
      );
      await load();
    }
  }

  if (loading) {
    return <p className="text-neutral-500">{lang === "th" ? "กำลังโหลด…" : "Loading…"}</p>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={load} className="mt-4 text-sm underline">
          {lang === "th" ? "ลองอีกครั้ง" : "Retry"}
        </button>
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-500">
          {lang === "th" ? "ตะกร้าว่าง" : "Your cart is empty."}
        </p>
        <Link
          href={hrefWithLang("/shop", lang)}
          className="mt-6 inline-block text-sm underline"
        >
          {lang === "th" ? "ไปที่ร้านค้า" : "Continue shopping"}
        </Link>
      </div>
    );
  }

  const total = formatStorePrice(cart.totals.total_price, {
    currency_minor_unit: cart.totals.currency_minor_unit,
    currency_prefix: cart.totals.currency_prefix,
    currency_suffix: cart.totals.currency_suffix,
  });

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-neutral-200">
        {cart.items.map((item) => (
          <li key={item.key} className="flex gap-6 py-6">
            {item.images[0] && (
              <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-neutral-100">
                <Image
                  src={item.images[0].thumbnail || item.images[0].src}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <Link
                href={hrefWithLang(`/shop/${productSlugFromPermalink(item.permalink)}`, lang)}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-neutral-600">
                {formatStorePrice(item.prices.price, item.prices)}
              </p>
              <div className="mt-auto flex items-center gap-4 pt-3">
                <label className="flex items-center gap-2 text-sm">
                  {lang === "th" ? "จำนวน" : "Qty"}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(item.key, Math.max(1, Number(e.target.value)))
                    }
                    className="w-16 border border-neutral-300 px-2 py-1"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  className="text-xs text-neutral-500 underline hover:text-black"
                >
                  {lang === "th" ? "ลบ" : "Remove"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-black pt-6">
        <div className="flex justify-between text-lg font-medium">
          <span>{lang === "th" ? "รวม" : "Total"}</span>
          <span>{total}</span>
        </div>
        <Link
          href={hrefWithLang("/shop/checkout", lang)}
          className="mt-6 block bg-black py-4 text-center text-xs font-medium uppercase tracking-widest text-white hover:bg-neutral-800"
        >
          {lang === "th" ? "ชำระเงิน" : "Checkout"}
        </Link>
      </div>
    </div>
  );
}
