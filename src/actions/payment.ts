"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getClient } from "./booking";
import { getProvider } from "./provider";
import { paypalClient } from "@/lib/paypal";
import { OrdersController, CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";

export async function createPayPalOrder(serviceId: string, slotStart: Date) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });

  if (!service) return { success: false, message: "Service not found" };

  const client = await getClient();
  const endTime = new Date(slotStart.getTime() + service.duration_minutes * 60000);

  // Buffer calculation
  const endTimeWithBuffer = new Date(endTime.getTime() + service.buffer_minutes * 60000);
  const startOfDay = new Date(slotStart);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(slotStart);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingApts = await prisma.appointment.findMany({
    where: {
      providerId: service.providerId,
      status: { not: "CANCELLED" },
      start_time: { gte: startOfDay, lt: endOfDay },
    },
    include: { service: true }
  });

  const overlap = existingApts.some((apt) => {
      const aptBufferMs = apt.service.buffer_minutes * 60000;
      const aptEndWithBuffer = new Date(apt.end_time.getTime() + aptBufferMs);
      return apt.start_time < endTimeWithBuffer && aptEndWithBuffer > slotStart;
  });

  if (overlap) {
    return { success: false, message: "Time slot is no longer available." };
  }

  // Create PENDING appointment
  const appointment = await prisma.appointment.create({
    data: {
      clientId: client.id,
      providerId: service.providerId,
      serviceId: service.id,
      start_time: slotStart,
      end_time: endTime,
      status: "PENDING",
    },
  });

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  try {
     const ordersController = new OrdersController(paypalClient);
     const { body } = await ordersController.createOrder({
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
               {
                   amount: {
                       currencyCode: "USD",
                       value: service.price.toString()
                   },
                   description: `${service.title} with ${service.provider.name}`
               }
            ],
            paymentSource: {
                paypal: {
                   experienceContext: {
                      returnUrl: `${baseUrl}/services/${serviceId}/success?paypal=true&appointmentId=${appointment.id}`,
                      cancelUrl: `${baseUrl}/services/${serviceId}/book?canceled=true`
                   }
                }
            }
        }
     });

     const parsedBody = JSON.parse(body as string);

     if (parsedBody.id) {
         // Save the order ID to the payment intent ID for tracking
         await prisma.appointment.update({
            where: { id: appointment.id },
            data: { paymentIntentId: parsedBody.id }
         });

         const approveLink = parsedBody.links?.find((link: { rel: string; href: string }) => link.rel === "payer-action");
         if (approveLink) {
             return { success: true, url: approveLink.href };
         }
     }

     throw new Error("Failed to generate PayPal checkout link.");

  } catch (err: unknown) {
     await prisma.appointment.delete({ where: { id: appointment.id } });
     return { success: false, message: (err as Error).message || "Failed to create PayPal order." };
  }
}

export async function createCheckoutSession(serviceId: string, slotStart: Date) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });

  if (!service) return { success: false, message: "Service not found" };

  if (!service.provider.stripeConnectLinked || !service.provider.stripeAccountId) {
    return { success: false, message: "This provider cannot currently accept payments." };
  }

  const client = await getClient();
  const endTime = new Date(slotStart.getTime() + service.duration_minutes * 60000);

  // Calculate new appointment end time including buffer for overlap checking
  const endTimeWithBuffer = new Date(endTime.getTime() + service.buffer_minutes * 60000);

  // Fetch all appointments for the day to safely check buffer overlaps
  const startOfDay = new Date(slotStart);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(slotStart);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingApts = await prisma.appointment.findMany({
    where: {
      providerId: service.providerId,
      status: { not: "CANCELLED" },
      start_time: { gte: startOfDay, lt: endOfDay },
    },
    include: { service: true }
  });

  const overlap = existingApts.some((apt) => {
      const aptBufferMs = apt.service.buffer_minutes * 60000;
      const aptEndWithBuffer = new Date(apt.end_time.getTime() + aptBufferMs);
      return apt.start_time < endTimeWithBuffer && aptEndWithBuffer > slotStart;
  });

  if (overlap) {
    return { success: false, message: "Time slot is no longer available." };
  }

  // Create PENDING appointment
  const appointment = await prisma.appointment.create({
    data: {
      clientId: client.id,
      providerId: service.providerId,
      serviceId: service.id,
      start_time: slotStart,
      end_time: endTime,
      status: "PENDING",
    },
  });

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const amountCents = Math.round(service.price * 100);
  // Pro providers pay 0% platform fee, regular providers pay 10%
  const platformFee = service.provider.isPro ? 0 : Math.round(amountCents * 0.10);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${service.title} with ${service.provider.name}`,
              description: `Appointment at ${slotStart.toLocaleString()}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        ...(platformFee > 0 ? { application_fee_amount: platformFee } : {}),
        transfer_data: {
          destination: service.provider.stripeAccountId,
        },
      },
      success_url: `${baseUrl}/services/${serviceId}/success`,
      cancel_url: `${baseUrl}/services/${serviceId}/book?canceled=true`,
      metadata: {
        appointmentId: appointment.id,
      },
    });

    // Save the Stripe session ID or Payment Intent ID to the appointment record for future refunds
    // Due to async event emission, we only have the session ID reliably before completion
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        paymentIntentId: session.id
      }
    });

    return { success: true, url: session.url };
  } catch (error: unknown) {
    // Revert appointment creation on Stripe error
    await prisma.appointment.delete({ where: { id: appointment.id } });
    return { success: false, message: (error as Error).message || "Failed to create checkout session" };
  }
}

export async function createStripeConnectAccount() {
  const provider = await getProvider();

  if (provider.stripeAccountId) {
    return provider.stripeAccountId;
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: provider.email,
  });

  await prisma.user.update({
    where: { id: provider.id },
    data: { stripeAccountId: account.id },
  });

  return account.id;
}

export async function createStripeConnectLink() {
  const provider = await getProvider();

  let accountId = provider.stripeAccountId;
  if (!accountId) {
    accountId = await createStripeConnectAccount();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/api/stripe/refresh`,
    return_url: `${baseUrl}/api/stripe/return`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function checkStripeConnectStatus() {
  try {
     const provider = await getProvider();

     if (!provider.stripeAccountId) {
       return false;
     }

     const account = await stripe.accounts.retrieve(provider.stripeAccountId);

     const isLinked = account.details_submitted && account.charges_enabled;

     if (isLinked !== provider.stripeConnectLinked) {
       await prisma.user.update({
         where: { id: provider.id },
         data: { stripeConnectLinked: isLinked },
       });
     }

     return isLinked;
  } catch(e) {
     return false;
  }
}
