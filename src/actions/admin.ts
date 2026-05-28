"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Admin access required.");
  }
  return session.user;
}

export async function getAllUsers() {
  await checkAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteUser(id: string) {
  const admin = await checkAdmin();
  if (admin.id === id) throw new Error("Cannot delete yourself.");

  await prisma.user.delete({
    where: { id }
  });
  revalidatePath("/dashboard/admin");
}

export async function getAllServices() {
  await checkAdmin();
  return prisma.service.findMany({
    include: { provider: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteService(id: string) {
  await checkAdmin();
  await prisma.service.delete({
    where: { id }
  });
  revalidatePath("/dashboard/admin");
  revalidatePath("/services");
}

export async function getAdminPlatformAnalytics() {
  await checkAdmin();

  const [totalUsers, totalServices, confirmedAppointments] = await Promise.all([
     prisma.user.count(),
     prisma.service.count(),
     prisma.appointment.findMany({
        where: { status: 'CONFIRMED' },
        include: { service: true }
     })
  ]);

  const totalGMV = confirmedAppointments.reduce((acc, curr) => acc + curr.service.price, 0);
  const platformFees = totalGMV * 0.10; // 10% fee hardcoded in checkout logic

  return {
    totalUsers,
    totalServices,
    totalGMV,
    platformFees
  };
}

export async function getAllReviews() {
  await checkAdmin();
  return prisma.review.findMany({
    include: {
       client: { select: { name: true, email: true } },
       provider: { select: { name: true } },
       appointment: { select: { service: { select: { title: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteReview(id: string) {
  await checkAdmin();
  await prisma.review.delete({
    where: { id }
  });
  revalidatePath("/dashboard/admin");
  revalidatePath("/services");
}
