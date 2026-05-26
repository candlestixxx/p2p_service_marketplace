"use server";

import { prisma } from "@/lib/prisma";

export async function getAllServices(query?: string, location?: string) {
  return prisma.service.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { provider: { name: { contains: query, mode: "insensitive" } } },
          ],
        } : {},
        location ? {
          provider: {
            OR: [
              { city: { contains: location, mode: "insensitive" } },
              { zip_code: { contains: location, mode: "insensitive" } },
              { state: { contains: location, mode: "insensitive" } },
            ]
          }
        } : {},
      ]
    },
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
