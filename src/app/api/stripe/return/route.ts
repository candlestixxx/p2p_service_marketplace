import { NextResponse } from "next/server";
import { checkStripeConnectStatus } from "@/actions/payment";

export async function GET(req: Request) {
  // Sync the status with our database immediately upon return
  await checkStripeConnectStatus();

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  return NextResponse.redirect(`${protocol}://${host}/dashboard/provider/payments`);
}
