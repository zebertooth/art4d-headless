import {
  addToCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/store-api";
import {
  getCartTokenFromRequest,
  jsonWithCartToken,
} from "@/lib/store-route";

export async function POST(request: Request) {
  try {
    const token = getCartTokenFromRequest(request);
    const body = (await request.json()) as {
      action: "add" | "update" | "remove";
      productId?: number;
      key?: string;
      quantity?: number;
    };

    let result;

    switch (body.action) {
      case "add":
        if (!body.productId) {
          return Response.json({ error: "productId required" }, { status: 400 });
        }
        result = await addToCart(
          body.productId,
          body.quantity ?? 1,
          token,
        );
        break;
      case "update":
        if (!body.key || body.quantity === undefined) {
          return Response.json({ error: "key and quantity required" }, { status: 400 });
        }
        result = await updateCartItem(body.key, body.quantity, token);
        break;
      case "remove":
        if (!body.key) {
          return Response.json({ error: "key required" }, { status: 400 });
        }
        result = await removeCartItem(body.key, token);
        break;
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    return jsonWithCartToken(result.data, result.cartToken);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Cart error" },
      { status: 500 },
    );
  }
}
