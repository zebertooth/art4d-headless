"use client";

import Link from "next/link";
import { useState } from "react";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

export function AddToCartButton({
  productId,
  lang,
  className = "",
}: {
  productId: number;
  lang: WPLanguage;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      alert(lang === "th" ? "ไม่สามารถเพิ่มลงตะกร้าได้" : "Could not add to cart");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Link
        href={hrefWithLang("/shop/cart", lang)}
        className={`inline-block border border-black bg-black px-8 py-3 text-center text-xs font-medium uppercase tracking-widest text-white hover:bg-neutral-800 ${className}`}
      >
        {lang === "th" ? "ดูตะกร้า" : "View cart"}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-block border border-black px-8 py-3 text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 ${className}`}
    >
      {loading
        ? lang === "th"
          ? "กำลังเพิ่ม…"
          : "Adding…"
        : lang === "th"
          ? "หยิบใส่ตะกร้า"
          : "Add to cart"}
    </button>
  );
}
