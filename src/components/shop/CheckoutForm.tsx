"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { hrefWithLang } from "@/lib/navigation";
import { storeFetch } from "@/lib/store-client";
import { PAYMENT_METHODS } from "@/lib/store-types";
import type { WCCart, WCCheckout } from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";

const emptyAddress = {
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "TH",
  email: "",
  phone: "",
};

export function CheckoutForm({ lang }: { lang: WPLanguage }) {
  const [cart, setCart] = useState<WCCart | null>(null);
  const [billing, setBilling] = useState(emptyAddress);
  const [shipping, setShipping] = useState({ ...emptyAddress, email: undefined });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("paysolutions");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storeFetch<WCCart>("/api/store/cart");
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateBilling(field: string, value: string) {
    setBilling((prev) => ({ ...prev, [field]: value }));
  }

  function updateShipping(field: string, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const shippingAddress = sameAsBilling
      ? { ...billing, email: undefined }
      : shipping;

    try {
      await storeFetch("/api/store/checkout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billing,
          shipping_address: shippingAddress,
        }),
      });

      if (cart?.needs_shipping && cart.shipping_rates[0]?.shipping_rates[0]) {
        const pkg = cart.shipping_rates[0];
        const rate = pkg.shipping_rates.find((r) => r.selected) ?? pkg.shipping_rates[0];
        await storeFetch("/api/store/checkout", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipping_rate: {
              package_id: pkg.package_id,
              rate_id: rate.rate_id,
            },
          }),
        });
      }

      const checkout = await storeFetch<WCCheckout>("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billing,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          customer_note: note,
        }),
      });

      const redirect = checkout.payment_result?.redirect_url;
      if (redirect) {
        window.location.href = redirect;
        return;
      }

      if (checkout.order_id) {
        window.location.href = hrefWithLang(
          `/shop/order-received?order_id=${checkout.order_id}&key=${checkout.order_key}`,
          lang,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-500">{lang === "th" ? "กำลังโหลด…" : "Loading…"}</p>;
  }

  if (!cart?.items.length) {
    return (
      <p className="text-neutral-500">
        {lang === "th" ? "ตะกร้าว่าง" : "Cart is empty."}{" "}
        <Link href={hrefWithLang("/shop", lang)} className="underline">
          {lang === "th" ? "ไปที่ร้านค้า" : "Shop"}
        </Link>
      </p>
    );
  }

  const availableMethods = PAYMENT_METHODS.filter((m) =>
    cart.payment_methods.includes(m.id),
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-2">
      <div className="space-y-8">
        <fieldset>
          <legend className="mb-4 font-display text-xl">
            {lang === "th" ? "ข้อมูลการเรียกเก็บเงิน" : "Billing details"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={lang === "th" ? "ชื่อ" : "First name"} value={billing.first_name} onChange={(v) => updateBilling("first_name", v)} required />
            <Field label={lang === "th" ? "นามสกุล" : "Last name"} value={billing.last_name} onChange={(v) => updateBilling("last_name", v)} required />
            <Field label="Email" type="email" value={billing.email} onChange={(v) => updateBilling("email", v)} required className="sm:col-span-2" />
            <Field label={lang === "th" ? "โทรศัพท์" : "Phone"} value={billing.phone} onChange={(v) => updateBilling("phone", v)} required className="sm:col-span-2" />
            <Field label={lang === "th" ? "ที่อยู่" : "Address"} value={billing.address_1} onChange={(v) => updateBilling("address_1", v)} required className="sm:col-span-2" />
            <Field label={lang === "th" ? "เมือง" : "City"} value={billing.city} onChange={(v) => updateBilling("city", v)} required />
            <Field label={lang === "th" ? "รหัสไปรษณีย์" : "Postcode"} value={billing.postcode} onChange={(v) => updateBilling("postcode", v)} required />
          </div>
        </fieldset>

        {cart.needs_shipping && (
          <fieldset>
            <legend className="mb-4 font-display text-xl">
              {lang === "th" ? "ที่อยู่จัดส่ง" : "Shipping address"}
            </legend>
            <label className="mb-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
              />
              {lang === "th" ? "เหมือนที่อยู่เรียกเก็บเงิน" : "Same as billing"}
            </label>
            {!sameAsBilling && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={lang === "th" ? "ชื่อ" : "First name"} value={shipping.first_name} onChange={(v) => updateShipping("first_name", v)} required />
                <Field label={lang === "th" ? "นามสกุล" : "Last name"} value={shipping.last_name} onChange={(v) => updateShipping("last_name", v)} required />
                <Field label={lang === "th" ? "ที่อยู่" : "Address"} value={shipping.address_1} onChange={(v) => updateShipping("address_1", v)} required className="sm:col-span-2" />
                <Field label={lang === "th" ? "เมือง" : "City"} value={shipping.city} onChange={(v) => updateShipping("city", v)} required />
                <Field label={lang === "th" ? "รหัสไปรษณีย์" : "Postcode"} value={shipping.postcode} onChange={(v) => updateShipping("postcode", v)} required />
              </div>
            )}
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-4 font-display text-xl">
            {lang === "th" ? "ชำระเงิน" : "Payment"}
          </legend>
          <div className="space-y-2">
            {availableMethods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 border border-neutral-200 px-4 py-3">
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                />
                <span className="text-sm">{method.label[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm">
          {lang === "th" ? "หมายเหตุ" : "Order notes"}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-neutral-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-neutral-200 p-6">
          <h2 className="font-display text-xl">
            {lang === "th" ? "สรุปคำสั่งซื้อ" : "Order summary"}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-black py-4 text-xs font-medium uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting
              ? lang === "th"
                ? "กำลังดำเนินการ…"
                : "Processing…"
              : lang === "th"
                ? "ชำระเงิน"
                : "Place order"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-300 px-3 py-2"
      />
    </label>
  );
}
