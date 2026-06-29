import { getCart } from "@/lib/store-api";
import {
  getCartTokenFromRequest,
  jsonWithCartToken,
} from "@/lib/store-route";

export async function GET(request: Request) {
  try {
    const token = getCartTokenFromRequest(request);
    const { data, cartToken } = await getCart(token);
    return jsonWithCartToken(data, cartToken);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Cart error" },
      { status: 500 },
    );
  }
}
