import {
  getCheckout,
  processCheckout,
  selectShippingRate,
  updateCartCustomer,
  updateCheckout,
} from "@/lib/store-api";
import {
  getCartTokenFromRequest,
  jsonWithCartToken,
} from "@/lib/store-route";

export async function GET(request: Request) {
  try {
    const token = await getCartTokenFromRequest(request);
    const { data, cartToken } = await getCheckout(token);
    return jsonWithCartToken(data, cartToken);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Checkout error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getCartTokenFromRequest(request);
    const body = await request.json();

    if (body.shipping_rate) {
      const { package_id, rate_id } = body.shipping_rate as {
        package_id: number;
        rate_id: string;
      };
      const shipping = await selectShippingRate(package_id, rate_id, token);
      return jsonWithCartToken(shipping.data, shipping.cartToken);
    }

    if (body.billing_address || body.shipping_address) {
      const customer = await updateCartCustomer(
        {
          billing_address: body.billing_address,
          shipping_address: body.shipping_address,
        },
        token,
      );
      return jsonWithCartToken(customer.data, customer.cartToken);
    }

    const checkout = await updateCheckout(body, token);
    return jsonWithCartToken(checkout.data, checkout.cartToken);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Checkout update error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getCartTokenFromRequest(request);
    const body = (await request.json()) as {
      billing_address: Record<string, string>;
      shipping_address: Record<string, string>;
      payment_method: string;
      customer_note?: string;
    };

    const { data, cartToken } = await processCheckout(body, token);
    return jsonWithCartToken(data, cartToken);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Checkout error" },
      { status: 500 },
    );
  }
}
