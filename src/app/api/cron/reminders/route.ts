import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationNotifications } from "@/lib/notifications";

export async function GET(req: Request) {
  // Verify cron secret if needed (Vercel Cron standard)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
     const now = new Date();
     const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
     const tomorrowEnd = new Date(tomorrowStart.getTime() + 60 * 60 * 1000); // 1 hour window to avoid duplicate sends

     const upcomingAppointments = await prisma.appointment.findMany({
         where: {
             status: "CONFIRMED",
             start_time: {
                 gte: tomorrowStart,
                 lt: tomorrowEnd
             }
         },
         include: {
             client: true,
             provider: true,
             service: true
         }
     });

     let sentCount = 0;
     for (const apt of upcomingAppointments) {
         // Using the existing notification module (you could create a distinct "sendReminderNotification" module instead)
         await sendBookingConfirmationNotifications(
             apt.client.email,
             "555-0199",
             `REMINDER: ${apt.service.title}`,
             apt.provider.name || "Provider",
             apt.start_time
         );
         sentCount++;
     }

     return NextResponse.json({ success: true, count: sentCount });

  } catch (error) {
     console.error("Failed to process cron reminders:", error);
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
