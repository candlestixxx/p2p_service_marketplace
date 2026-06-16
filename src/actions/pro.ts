"use server";

import { prisma } from "@/lib/prisma";
import { getProvider } from "./provider";
import { revalidatePath } from "next/cache";

export async function toggleProStatus() {
  const provider = await getProvider();

  await prisma.user.update({
    where: { id: provider.id },
    data: {
      isPro: !provider.isPro
    }
  });

  revalidatePath("/dashboard/provider/profile");
}
