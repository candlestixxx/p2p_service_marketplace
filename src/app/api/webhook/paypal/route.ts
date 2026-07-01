import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationNotifications } from "@/lib/notifications";
import { paypalClient } from "@/lib/paypal";
import { OrdersController } from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
     const body = await req.json();

     // CHECKOUT.ORDER.APPROVED event happens when the user clicks 'Pay Now' on the PayPal pop-up.
     // However, the payment is NOT captured yet. We must manually capture it.
     if (body.event_type === "CHECKOUT.ORDER.APPROVED") {
        const orderId = body.resource.id;

        // Find the PENDING appointment holding this orderId
        const appointment = await prisma.appointment.findFirst({
            where: { paymentIntentId: orderId, status: "PENDING" },
            include: { client: true, service: true, provider: true }
        });

        if (appointment) {
            const ordersController = new OrdersController(paypalClient);
            // Capture the actual funds now
            await ordersController.captureOrder({
                id: orderId
            });

            // Update to CONFIRMED since funds are now captured
            await prisma.appointment.update({
                where: { id: appointment.id },
                data: { status: "CONFIRMED" }
            });

            // Trigger Notifications
            await sendBookingConfirmationNotifications(
                appointment.client.email,
                "555-0199",
                appointment.service.title,
                appointment.provider.name || "Provider",
                appointment.start_time
            );
        }
     }

     return NextResponse.json({ received: true });
  } catch(error) {
     console.error("PayPal Webhook Error:", error);
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
