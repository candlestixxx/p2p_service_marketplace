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
