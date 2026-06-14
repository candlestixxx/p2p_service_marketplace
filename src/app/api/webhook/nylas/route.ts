import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// In Nylas V3 Node.js SDK, signature validation can be done via verifyWebhookSignature
// We need NYLAS_WEBHOOK_SECRET to do so.

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nylas-signature");

    if (!process.env.NYLAS_WEBHOOK_SECRET) {
      console.warn("NYLAS_WEBHOOK_SECRET is not configured. Rejecting request.");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    if (!signature) {
       return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Try signature validation using Node crypto manually since `req.text()` gives us the raw body payload.
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", process.env.NYLAS_WEBHOOK_SECRET);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
       console.error("Nylas webhook signature mismatch.");
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    // Example handling of an event
    if (data.type === "event.created" || data.type === "event.deleted" || data.type === "event.updated") {
      // Find the user by grantId and revalidate their availability or trigger a re-sync
      const grantId = data.data?.object?.grant_id || data.data?.grant_id;
      if (grantId) {
        // You could log this or trigger internal actions
        console.log(`Nylas event ${data.type} for grant: ${grantId}`);
        // Optionally update something in DB or revalidate paths

        const user = await prisma.user.findFirst({
           where: {
              nylasGrantId: grantId,
           }
        });

        if (user) {
           revalidatePath("/dashboard/client");
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Nylas webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Respond to the Nylas webhook challenge
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("challenge");
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Challenge not found" }, { status: 400 });
}
