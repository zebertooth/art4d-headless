/** Test getCart workaround logic against live WP */
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

async function getCart(cartToken) {
  if (!cartToken) return storeFetch("/cart");

  const items = await storeFetch("/cart/items", {
    headers: { "Cart-Token": cartToken },
  });
  if (!Array.isArray(items) || !items.length) {
    return { items_count: 0, items: [] };
  }

  return storeFetch("/cart/update-item", {
    method: "POST",
    headers: { "Cart-Token": cartToken },
    body: JSON.stringify({ key: items[0].key, quantity: items[0].quantity }),
  });
}

const empty = await getCart(null);
token = null;
const added = await storeFetch("/cart/add-item", {
  method: "POST",
  body: JSON.stringify({ id: 119603, quantity: 1 }),
});
const addToken = token;
const cart = await getCart(addToken);
console.log("add items", added.items_count, "getCart items", cart.items_count);
process.exit(cart.items_count > 0 ? 0 : 1);
