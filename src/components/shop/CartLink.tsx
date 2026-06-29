"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hrefWithLang } from "@/lib/navigation";
import { storeFetch } from "@/lib/store-client";
import type { WCCart } from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";

export function CartLink({ lang }: { lang: WPLanguage }) {
  const [count, setCount] = useState(0);

  async function loadCart() {
    try {
      const cart = await storeFetch<WCCart>("/api/store/cart");
      setCount(cart.items_count ?? 0);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadCart();
    const handler = () => loadCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  return (
    <Link
      href={hrefWithLang("/shop/cart", lang)}
      className="hover:text-black"
    >
      {lang === "th" ? "ตะกร้า" : "Cart"}
      {count > 0 && (
        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
