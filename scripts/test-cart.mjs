/** Test cart via Next proxy after getCart fix */
const base = process.env.SITE ?? "https://art4d-headless.vercel.app";

let cartToken = null;
let cookieJar = "";

function absorb(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const part = c.split(";")[0];
    if (part.startsWith("wc_cart_token=")) cookieJar = part;
  }
  const header = res.headers.get("Cart-Token");
  if (header) cartToken = header;
  return res.json().then((data) => {
    if (data._cartToken) cartToken = data._cartToken;
    return data;
  });
}

async function api(path, opts = {}) {
  const headers = { ...opts.headers };
  if (cartToken) headers["Cart-Token"] = cartToken;
  if (cookieJar) headers.Cookie = cookieJar;
  const res = await fetch(`${base}${path}`, { ...opts, headers });
  return absorb(res);
}

const r1 = await api("/api/store/cart");
console.log("GET empty:", r1.items_count);

const r2 = await api("/api/store/cart/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "add", productId: 119603, quantity: 1 }),
});
console.log("ADD:", r2.items_count);

const r3 = await api("/api/store/cart");
console.log("GET after:", r3.items_count, "items", r3.items?.length);

process.exit(r3.items_count > 0 ? 0 : 1);
