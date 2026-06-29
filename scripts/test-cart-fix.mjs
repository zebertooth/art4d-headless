/** Test getCart via items assembly against live WP */
const STORE = "https://art4d.com/wp-json/wc/store/v1";

let token = null;

async function storeFetch(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (token) headers["Cart-Token"] = token;
  const res = await fetch(`${STORE}${path}`, { ...opts, headers });
  const t = res.headers.get("cart-token");
  if (t) token = t;
  return res.json();
}

function cartFromItems(items, cartToken) {
  if (!items.length) return { items_count: 0, items: [] };
  let total = 0;
  let count = 0;
  for (const item of items) {
    count += item.quantity;
    total += Number(item.totals.line_total);
  }
  return { items_count: count, items, totals: { total_price: String(total) } };
}

async function getCart(cartToken) {
  if (!cartToken) return storeFetch("/cart");
  const items = await storeFetch("/cart/items", {
    headers: { "Cart-Token": cartToken },
  });
  return cartFromItems(Array.isArray(items) ? items : [], cartToken);
}

await storeFetch("/cart");
const added = await storeFetch("/cart/add-item", {
  method: "POST",
  body: JSON.stringify({ id: 119270, quantity: 1 }),
});
const addToken = token;
const cart = await getCart(addToken);
console.log("getCart items", cart.items_count, "lines", cart.items?.length);
process.exit(cart.items_count > 0 ? 0 : 1);

