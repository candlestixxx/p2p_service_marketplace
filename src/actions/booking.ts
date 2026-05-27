"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getProviderAvailabilityForService(serviceId: string, dateStr: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });

  if (!service) throw new Error("Service not found");

  const targetDate = new Date(`${dateStr}T00:00:00.000Z`); // use UTC
  const dayOfWeek = targetDate.getUTCDay();

  const availability = await prisma.availability.findFirst({
    where: {
      providerId: service.providerId,
      day_of_week: dayOfWeek,
    },
  });

  if (!availability) {
    return { availableSlots: [] };
  }

  // Parse start and end times
  const [startHour, startMin] = availability.start_time.split(":").map(Number);
  const [endHour, endMin] = availability.end_time.split(":").map(Number);

  // Define start and end boundaries for the day
  const dayStart = new Date(targetDate);
  dayStart.setUTCHours(startHour, startMin, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setUTCHours(endHour, endMin, 0, 0);

  // Fetch existing appointments for that day
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Include the service associated with existing appointments to get their buffer_minutes
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      providerId: service.providerId,
      start_time: { gte: startOfDay, lt: endOfDay },
      status: { not: "CANCELLED" },
    },
    include: {
      service: true,
    }
  });

  const slots: { start: Date; end: Date }[] = [];
  const serviceDurationMs = service.duration_minutes * 60 * 1000;
  // Note: the buffer for the NEW appointment is also added
  const newAppointmentBufferMs = service.buffer_minutes * 60 * 1000;
  const currentSlotStart = new Date(dayStart);

  while (currentSlotStart.getTime() + serviceDurationMs <= dayEnd.getTime()) {
    const currentSlotEnd = new Date(currentSlotStart.getTime() + serviceDurationMs);
    const currentSlotWithBufferEnd = new Date(currentSlotEnd.getTime() + newAppointmentBufferMs);

    // Check for overlap with existing appointments, factoring in the existing appointment's buffer
    const hasOverlap = existingAppointments.some((apt: { start_time: Date; end_time: Date; service: { buffer_minutes: number } }) => {
      const aptBufferMs = apt.service.buffer_minutes * 60 * 1000;
      const aptEndWithBuffer = new Date(new Date(apt.end_time).getTime() + aptBufferMs);

      return (
        (currentSlotStart >= apt.start_time && currentSlotStart < aptEndWithBuffer) ||
        (currentSlotWithBufferEnd > apt.start_time && currentSlotWithBufferEnd <= aptEndWithBuffer) ||
        (currentSlotStart <= apt.start_time && currentSlotWithBufferEnd >= aptEndWithBuffer)
      );
    });

    if (!hasOverlap) {
      slots.push({
        start: new Date(currentSlotStart),
        end: currentSlotEnd,
      });
    }

    // Move to next slot (e.g., in 30 min increments)
    currentSlotStart.setTime(currentSlotStart.getTime() + 30 * 60000);
  }

  return { availableSlots: slots };
}

export async function getClient() {
  const session = await auth();
  if (!session?.user?.id) {
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

export async function bookAppointment(serviceId: string, startTime: Date) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Service not found");

  const client = await getClient();

  const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
  const endTimeWithBuffer = new Date(endTime.getTime() + service.buffer_minutes * 60000);

  // Fetch all appointments for the day to safely check buffer overlaps
  const startOfDay = new Date(startTime);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startTime);
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
      return apt.start_time < endTimeWithBuffer && aptEndWithBuffer > startTime;
  });

  if (overlap) {
    throw new Error("Time slot is no longer available.");
  }

  await prisma.appointment.create({
    data: {
      clientId: client.id,
      providerId: service.providerId,
      serviceId: service.id,
      start_time: startTime,
      end_time: endTime,
      status: "CONFIRMED",
    },
  });

  revalidatePath(`/services/${serviceId}/book`);
}
