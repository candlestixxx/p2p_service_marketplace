"use server";

import { prisma } from "@/lib/prisma";
import { algoliaClient, SERVICES_INDEX_NAME } from "@/lib/algolia";

export async function getAllServices(query?: string, location?: string, category?: string, page: number = 1, limit: number = 12) {
  // Try Algolia Search first if query or location exists
  if ((query || location || category) && process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_API_KEY) {
     try {
         const filters: string[] = [];
         if (category) filters.push(`category:"${category}"`);

         const searchQuery = [query, location].filter(Boolean).join(" ");

         const { hits, nbHits, nbPages } = await algoliaClient.searchSingleIndex({
             indexName: SERVICES_INDEX_NAME,
             searchParams: {
                 query: searchQuery,
                 filters: filters.join(" AND "),
                 page: page - 1,
                 hitsPerPage: limit
             }
         });

         const serviceIds = hits.map((h: Record<string, unknown>) => h.objectID as string);

         // Fetch the full rich data from Prisma using the returned IDs
         const services = await prisma.service.findMany({
             where: { id: { in: serviceIds } },
             include: {
                 provider: {
                     include: {
                         providerReviews: { select: { rating: true } }
                     }
                 }
             }
         });

         // Maintain Algolia ranking order
         const sortedServices = services.sort((a, b) => serviceIds.indexOf(a.id) - serviceIds.indexOf(b.id));

         const mappedServices = sortedServices.map(service => {
             const totalRatings = service.provider.providerReviews.length;
             const avgRating = totalRatings > 0
                 ? service.provider.providerReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
                 : 0;

             return {
                 ...service,
                 provider: {
                     ...service.provider,
                     avgRating: avgRating.toFixed(1),
                     totalRatings
                 }
             }
         });

         return {
             services: mappedServices,
             totalCount: nbHits,
             totalPages: nbPages || 1
         };
     } catch (e) {
         console.warn("Algolia search failed, falling back to database query:", e);
     }
  }

  // Fallback to native Prisma Search (Slow but reliable)
  const whereClause = {
    AND: [
      query ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
          { provider: { name: { contains: query, mode: "insensitive" as const } } },
        ],
      } : {},
      category ? {
        category: { equals: category, mode: "insensitive" as const }
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
        provider: {
          include: {
            providerReviews: {
              select: {
                rating: true
              }
            }
          }
        },
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

  const mappedServices = services.map(service => {
     const totalRatings = service.provider.providerReviews.length;
     const avgRating = totalRatings > 0
       ? service.provider.providerReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
       : 0;

     return {
       ...service,
       provider: {
         ...service.provider,
         avgRating: avgRating.toFixed(1),
         totalRatings
       }
     }
  });

  return {
    services: mappedServices,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function getServiceDetails(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        include: {
          providerReviews: {
             select: { rating: true, comment: true, createdAt: true, client: { select: { name: true } } },
             orderBy: { createdAt: 'desc' },
             take: 10
          }
        }
      }
    },
  });

  if (!service) return null;

  const totalRatings = service.provider.providerReviews.length;
  const avgRating = totalRatings > 0
    ? service.provider.providerReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
    : 0;

  return {
    ...service,
    provider: {
      ...service.provider,
      avgRating: avgRating.toFixed(1),
      totalRatings
    }
  }
}

export async function getPublicProviderDetails(providerId: string) {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    include: {
      services: {
        orderBy: { createdAt: 'desc' }
      },
      providerReviews: {
        include: {
           client: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!provider || provider.role !== "PROVIDER") {
     return null;
  }

  const totalRatings = provider.providerReviews.length;
  const avgRating = totalRatings > 0
    ? provider.providerReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
    : 0;

  return {
    ...provider,
    avgRating: avgRating.toFixed(1),
    totalRatings
  };
}
