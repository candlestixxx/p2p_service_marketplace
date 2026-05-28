"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function getProvider() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PROVIDER") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
     throw new Error("User not found");
  }

  return user;
}

export async function addService(data: {
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  buffer_minutes: number;
  category?: string;
}) {
  const provider = await getProvider();

  await prisma.service.create({
    data: {
      ...data,
      providerId: provider.id,
    },
  });

  revalidatePath("/dashboard/provider/services");
}

export async function getProviderServices() {
  try {
     const provider = await getProvider();
     return prisma.service.findMany({
       where: { providerId: provider.id },
     });
  } catch(e) {
     return [];
  }
}

export async function updateAvailability(availabilities: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[]) {
  const provider = await getProvider();

  await prisma.availability.deleteMany({
    where: { providerId: provider.id },
  });

  const activeAvailabilities = availabilities.filter((a) => a.is_active);

  if (activeAvailabilities.length > 0) {
    await prisma.availability.createMany({
      data: activeAvailabilities.map((a) => ({
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        providerId: provider.id,
      })),
    });
  }

  revalidatePath("/dashboard/provider/availability");
}

export async function getProviderAvailability() {
  try {
     const provider = await getProvider();
     return prisma.availability.findMany({
        where: { providerId: provider.id },
     });
  } catch(e) {
     return [];
  }
}

export async function getProviderAppointments() {
  try {
     const provider = await getProvider();
     return prisma.appointment.findMany({
       where: { providerId: provider.id },
       include: {
         service: true,
         client: true,
       },
     });
  } catch(e) {
     return [];
  }
}

export async function updateProfile(data: { city: string; state: string; zip_code: string; image?: string; portfolioUrls?: string[] }) {
  const provider = await getProvider();

  const updateData: { city: string; state: string; zip_code: string; image?: string; portfolioUrls?: string[] } = {
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
  };

  if (data.image !== undefined) updateData.image = data.image;
  if (data.portfolioUrls !== undefined) updateData.portfolioUrls = data.portfolioUrls;

  await prisma.user.update({
    where: { id: provider.id },
    data: updateData
  });

  revalidatePath("/dashboard/provider/profile");
}

export async function updateAppointmentStatus(appointmentId: string, status: "CONFIRMED" | "CANCELLED") {
  const provider = await getProvider();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.providerId !== provider.id) {
    throw new Error("Unauthorized to modify this appointment");
  }

  // Trigger Stripe refund if payment was processed and Intent ID exists and Provider cancels
  if (status === "CANCELLED" && appointment.paymentIntentId && appointment.status === "CONFIRMED") {
      try {
        await stripe.refunds.create({
            payment_intent: appointment.paymentIntentId
        });
      } catch (err) {
        // We log the error, but still cancel the appointment in our database
        // In a production environment, this should trigger a manual review alert
        console.error("Failed to automatically refund Stripe payment:", err);
      }
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  revalidatePath("/dashboard/provider/appointments");
  revalidatePath("/dashboard/provider/calendar");
}

export async function deleteProviderService(serviceId: string) {
  const provider = await getProvider();

  // Verify ownership
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!service || service.providerId !== provider.id) {
    throw new Error("Unauthorized to delete this service.");
  }

  // Soft delete check: We shouldn't delete a service if there are PENDING/CONFIRMED appointments
  // But for this MVP, we will rely on Cascade deletion and basic cleanup.
  await prisma.service.delete({
    where: { id: serviceId }
  });

  revalidatePath("/dashboard/provider/services");
  revalidatePath("/services");
  revalidatePath(`/provider/${provider.id}`);
}
