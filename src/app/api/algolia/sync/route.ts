import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncServiceToAlgolia } from "@/lib/algolia";

// A secure route that can be hit via a cron job or manual fetch to batch resync all services to Algolia
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  // Simple bearer token check against our admin API key
  if (authHeader !== `Bearer ${process.env.ALGOLIA_ADMIN_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const services = await prisma.service.findMany({
      include: { provider: true },
    });

    for (const service of services) {
      await syncServiceToAlgolia(service);
    }

    return NextResponse.json({ success: true, count: services.length });
  } catch (error) {
    console.error("Batch Algolia sync failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
