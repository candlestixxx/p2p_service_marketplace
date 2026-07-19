import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationNotifications } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as unknown as Record<string, unknown>;
    const metadata = session?.metadata as Record<string, string>;

    // We update the record with the actual Payment Intent ID upon success
    // because session.payment_intent is guaranteed to be present here
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

    if (metadata?.appointmentId) {
      const updatedApt = await prisma.appointment.update({
        where: {
          id: metadata.appointmentId,
        },
        data: {
          status: "CONFIRMED",
          ...(paymentIntentId && { paymentIntentId })
        },
        include: {
          client: true,
          service: true,
          provider: true,
        }
      });

      // Send Mock SMS & Email Notification with PDF Attachment
      await sendBookingConfirmationNotifications(
        updatedApt.client.email,
        updatedApt.client.name || "Client",
        "555-0199", // mock client phone number
        updatedApt.service.title,
        updatedApt.provider.name || "Provider",
        updatedApt.service.price,
        updatedApt.start_time,
        updatedApt.id
      );
    }
  }

  return NextResponse.json({ received: true });
}
