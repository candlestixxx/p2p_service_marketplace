import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const appointmentId = resolvedParams.id;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: true,
      provider: true,
      client: true,
    }
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  // Ensure the user requesting the ICS is either the client or the provider
  if (appointment.clientId !== session.user.id && appointment.providerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date) => {
     return date.toISOString().replace(/[-:]/g, "").split('.')[0] + "Z";
  };

  const dtStart = formatICSDate(new Date(appointment.start_time));
  const dtEnd = formatICSDate(new Date(appointment.end_time));
  const dtStamp = formatICSDate(new Date());

  const summary = `ServiceHub: ${appointment.service.title}`;
  const description = `Appointment with ${appointment.provider.name} for ${appointment.service.title}.\\n\\nClient: ${appointment.client.name}`;

  const icsString = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ServiceHub//Marketplace//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@servicehub.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new NextResponse(icsString, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="appointment-${appointment.id}.ics"`,
    }
  });
}
