"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getClient } from "./booking";

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

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" }
  });

  // Revalidate the client dashboard to immediately show the updated status
  revalidatePath("/dashboard/client/appointments");
}
