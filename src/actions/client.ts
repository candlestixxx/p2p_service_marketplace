"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getClient } from "./booking";
import { stripe } from "@/lib/stripe";

export async function getClientAppointments() {
  try {
     const client = await getClient();
     return prisma.appointment.findMany({
       where: { clientId: client.id },
       include: {
         service: true,
         provider: true,
       },
       orderBy: {
         start_time: 'desc'
       }
     });
  } catch(e) {
     return [];
  }
}

export async function cancelAppointment(appointmentId: string) {
  const client = await getClient();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.clientId !== client.id) {
    throw new Error("Unauthorized to cancel this appointment");
  }

  // Trigger Stripe refund if payment was processed and Intent ID exists
  if (appointment.paymentIntentId && appointment.status === "CONFIRMED") {
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
    data: { status: "CANCELLED" }
  });

  // Revalidate the client dashboard to immediately show the updated status
  revalidatePath("/dashboard/client/appointments");
}

export async function createReview(appointmentId: string, rating: number, comment?: string) {
  const client = await getClient();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.clientId !== client.id) {
    throw new Error("Unauthorized");
  }

  if (appointment.status !== "CONFIRMED") {
    throw new Error("Can only review confirmed appointments");
  }

  // Basic check to see if appointment is in the past
  if (new Date() < appointment.end_time) {
    throw new Error("Can only review completed appointments");
  }

  if (appointment.review) {
    throw new Error("Review already exists for this appointment");
  }

  await prisma.review.create({
    data: {
      rating,
      comment,
      appointmentId,
      clientId: client.id,
      providerId: appointment.providerId,
    }
  });

  revalidatePath("/dashboard/client/appointments");
  revalidatePath("/services");
  revalidatePath(`/services/${appointment.serviceId}/book`);
}

export async function rescheduleAppointment(appointmentId: string, newStartTime: Date) {
  const client = await getClient();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true }
  });

  if (!appointment) throw new Error("Appointment not found");
  if (appointment.clientId !== client.id) throw new Error("Unauthorized");
  if (appointment.status === "CANCELLED") throw new Error("Cannot reschedule a cancelled appointment");

  const service = appointment.service;
  const newEndTime = new Date(newStartTime.getTime() + service.duration_minutes * 60000);
  const newEndTimeWithBuffer = new Date(newEndTime.getTime() + service.buffer_minutes * 60000);

  // Check for overlaps, EXCLUDING the current appointment we are rescheduling
  const startOfDay = new Date(newStartTime);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(newStartTime);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingApts = await prisma.appointment.findMany({
    where: {
      providerId: appointment.providerId,
      status: { not: "CANCELLED" },
      start_time: { gte: startOfDay, lt: endOfDay },
      id: { not: appointmentId } // Exclude self
    },
    include: { service: true }
  });

  const overlap = existingApts.some((apt) => {
      const aptBufferMs = apt.service.buffer_minutes * 60000;
      const aptEndWithBuffer = new Date(apt.end_time.getTime() + aptBufferMs);
      return apt.start_time < newEndTimeWithBuffer && aptEndWithBuffer > newStartTime;
  });

  if (overlap) {
    throw new Error("The selected time slot is no longer available.");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      start_time: newStartTime,
      end_time: newEndTime,
      // If it was PENDING, keep it PENDING, otherwise if CONFIRMED, it remains CONFIRMED
    }
  });

  revalidatePath("/dashboard/client/appointments");
  revalidatePath(`/dashboard/provider/appointments`);
}
