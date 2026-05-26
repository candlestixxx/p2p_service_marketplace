"use server";

import { prisma } from "@/lib/prisma";
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
