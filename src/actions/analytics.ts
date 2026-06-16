"use server";

import { prisma } from "@/lib/prisma";
import { getProvider } from "./provider";
import { getClient } from "./booking";

export async function getProviderAnalytics() {
  const provider = await getProvider();

  const appointments = await prisma.appointment.findMany({
    where: { providerId: provider.id },
    include: { service: true }
  });

  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED');
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');

  const totalRevenue = confirmedAppointments.reduce((acc, curr) => acc + curr.service.price, 0);

  // Future appointments (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingAppointments = confirmedAppointments.filter(a => {
    const aptDate = new Date(a.start_time);
    return aptDate >= now && aptDate <= nextWeek;
  }).length;

  return {
    totalAppointments,
    confirmedCount: confirmedAppointments.length,
    cancelledCount: cancelledAppointments.length,
    pendingCount: pendingAppointments.length,
    totalRevenue,
    upcomingAppointments
  };
}

export async function getClientAnalytics() {
  const client = await getClient();

  const appointments = await prisma.appointment.findMany({
    where: { clientId: client.id },
    include: { service: true, provider: true }
  });

  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED');
  const totalSpent = confirmedAppointments.reduce((acc, curr) => acc + curr.service.price, 0);

  const now = new Date();
  const upcomingAppointments = confirmedAppointments.filter(a => new Date(a.start_time) >= now).length;

  // Calculate favorite provider
  const providerCounts = confirmedAppointments.reduce((acc, curr) => {
    const pId = curr.provider.name || curr.providerId;
    acc[pId] = (acc[pId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let favoriteProvider = "None";
  let maxCount = 0;
  for (const [name, count] of Object.entries(providerCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteProvider = name;
    }
  }

  return {
    totalBookings: appointments.length,
    confirmedBookings: confirmedAppointments.length,
    totalSpent,
    upcomingAppointments,
    favoriteProvider
  };
}
