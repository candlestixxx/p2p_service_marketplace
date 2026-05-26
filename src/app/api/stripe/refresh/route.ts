import { NextResponse } from "next/server";
import { createStripeConnectLink } from "@/actions/payment";

export async function GET(req: Request) {
  try {
    const url = await createStripeConnectLink();
    return NextResponse.redirect(url);
  } catch (_error) {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return NextResponse.redirect(`${protocol}://${host}/dashboard/provider/payments`);
  }
}
