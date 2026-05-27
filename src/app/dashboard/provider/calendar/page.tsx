"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getProviderAppointments } from "@/actions/provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const appointments = await getProviderAppointments();
        const mappedEvents = appointments.map((apt) => ({
          id: apt.id,
          title: `${apt.service.title} - ${apt.client.name}`,
          start: new Date(apt.start_time),
          end: new Date(apt.end_time),
          resource: apt.status,
        }));
        setEvents(mappedEvents);
      } catch (_error) {
        toast.error("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  return (
    <Card className="flex flex-col flex-1 h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>View your upcoming appointments.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Loading your schedule...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", width: "100%" }}
            views={["month", "week", "day"]}
            defaultView="week"
            eventPropGetter={(event: Event & { resource?: string }) => {
              let backgroundColor = '#3174ad'; // default blue (CONFIRMED)
              if (event.resource === 'CANCELLED') backgroundColor = '#ef4444'; // red
              if (event.resource === 'PENDING') backgroundColor = '#eab308'; // yellow
              return { style: { backgroundColor } };
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
