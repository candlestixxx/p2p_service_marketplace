"use server";

import { prisma } from "@/lib/prisma";
import { getProvider } from "./provider";
import { revalidatePath } from "next/cache";

export async function connectNylas() {
  const provider = await getProvider();

  if (!process.env.NYLAS_CLIENT_ID) {
    throw new Error("Nylas API keys are not configured. Please contact the platform administrator.");
  }

  // In a real implementation, this would redirect to the Nylas Hosted Auth URL.
  // For now, we simulate a successful connection for testing purposes.
  await prisma.user.update({
    where: { id: provider.id },
    data: { nylasGrantId: "mock_grant_" + Date.now() }
  });

  revalidatePath("/dashboard/provider/profile");
}

export async function disconnectNylas() {
  const provider = await getProvider();

  await prisma.user.update({
    where: { id: provider.id },
    data: { nylasGrantId: null }
  });

  revalidatePath("/dashboard/provider/profile");
}
