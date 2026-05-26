"use server";

import { prisma } from "@/lib/prisma";

export async function getAllServices(query?: string, location?: string, page: number = 1, limit: number = 12) {
  const whereClause = {
    AND: [
      query ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
          { provider: { name: { contains: query, mode: "insensitive" as const } } },
        ],
      } : {},
      location ? {
        provider: {
          OR: [
            { city: { contains: location, mode: "insensitive" as const } },
            { zip_code: { contains: location, mode: "insensitive" as const } },
            { state: { contains: location, mode: "insensitive" as const } },
          ]
        }
      } : {},
    ]
  };

  const [services, totalCount] = await Promise.all([
    prisma.service.findMany({
      where: whereClause,
      include: {
        provider: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.service.count({
      where: whereClause,
    })
  ]);

  return {
    services,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function getServiceDetails(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      provider: true,
    },
  });
}
