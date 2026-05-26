"use server";

import { prisma } from "@/lib/prisma";

export async function getAllServices(query?: string) {
  return prisma.service.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { provider: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      provider: true,
    },
  });
}

export async function getServiceDetails(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      provider: true,
    },
  });
}
