"use server";

import { prisma } from "@/lib/prisma";
import { getProvider } from "./provider";
import { revalidatePath } from "next/cache";

import { nylas } from "@/lib/nylas";

export async function connectNylas() {
  const provider = await getProvider();

  if (!process.env.NYLAS_CLIENT_ID || !process.env.NYLAS_API_KEY) {
    // throw new Error("Nylas API keys are not configured. Please contact the platform administrator.");
    console.warn("Nylas API keys missing. Proceeding with mock connection.");
  }

  try {
     // In a full implementation, you would redirect to:
     // nylas.auth.urlForOAuth2({
     //   clientId: process.env.NYLAS_CLIENT_ID!,
     //   redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/nylas`,
     // })
     // And a callback route would capture the grantId.

    // For MVP scaffolding, we simulate the grant capture:
    await prisma.user.update({
      where: { id: provider.id },
      data: { nylasGrantId: "mock_grant_" + Date.now() }
    });
  } catch (error) {
     console.error("Nylas Connection Error:", error);
     throw new Error("Failed to connect external calendar.");
  }

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
