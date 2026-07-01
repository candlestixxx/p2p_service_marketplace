"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function sendMessage(data: { receiverId: string; content: string; appointmentId?: string }) {
  const user = await getUser();

  if (user.id === data.receiverId) {
    throw new Error("Cannot send a message to yourself.");
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: data.receiverId,
      content: data.content,
      appointmentId: data.appointmentId || null,
    },
  });

  revalidatePath(`/dashboard/messages`);
  if (data.appointmentId) {
      // Allow dynamic refresh if chatting via appointment detail modal
      revalidatePath(`/dashboard/client/appointments`);
      revalidatePath(`/dashboard/provider/appointments`);
  }

  return message;
}

export async function getConversation(receiverId: string) {
  const user = await getUser();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId },
        { senderId: receiverId, receiverId: user.id },
      ]
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
       sender: { select: { id: true, name: true, image: true, role: true } },
       receiver: { select: { id: true, name: true, image: true, role: true } }
    }
  });

  return messages;
}

export async function getRecentConversations() {
  const user = await getUser();

  // Find all messages where the user is either the sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } }
    }
  });

  // Group by the 'other' person
  const uniqueConversations = new Map();

  for (const message of messages) {
     const otherPersonId = message.senderId === user.id ? message.receiverId : message.senderId;
     if (!uniqueConversations.has(otherPersonId)) {
        uniqueConversations.set(otherPersonId, {
           contactId: otherPersonId,
           contactName: message.senderId === user.id ? message.receiver.name : message.sender.name,
           contactRole: message.senderId === user.id ? message.receiver.role : message.sender.role,
           lastMessage: message.content,
           lastMessageAt: message.createdAt
        });
     }
  }

  return Array.from(uniqueConversations.values());
}
