"use client";

import { useEffect, useState } from "react";
import { getClientAppointments } from "@/actions/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Appointment, Service, User } from "@prisma/client";

type AppointmentWithDetails = Appointment & { service: Service, provider: User };

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      const data = await getClientAppointments();
      setAppointments(data as AppointmentWithDetails[]);
      setLoading(false);
    }
    loadAppointments();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>Review your upcoming and past appointments.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground p-4">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">No appointments found.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                <div>
                  <h3 className="font-medium text-lg">{apt.service.title}</h3>
                  <p className="text-sm text-muted-foreground">Provider: {apt.provider.name}</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-semibold">{format(new Date(apt.start_time), 'PPpp')}</div>
                  <div className={`text-sm mt-1 inline-block px-2 py-1 rounded-full ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {apt.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
