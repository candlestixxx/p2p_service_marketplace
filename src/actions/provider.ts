"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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

export async function updateProfile(data: { city: string; state: string; zip_code: string }) {
  const provider = await getProvider();

  await prisma.user.update({
    where: { id: provider.id },
    data: {
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
    }
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

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  revalidatePath("/dashboard/provider/appointments");
  revalidatePath("/dashboard/provider/calendar");
}
