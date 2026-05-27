"use client";

import { useEffect, useState } from "react";
import { getClientAppointments, cancelAppointment } from "@/actions/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Appointment, Service, User } from "@prisma/client";
import { toast } from "sonner";

type AppointmentWithDetails = Appointment & { service: Service, provider: User };

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadAppointments = async () => {
    const data = await getClientAppointments();
    setAppointments(data as AppointmentWithDetails[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancellingId(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment cancelled successfully");
      await loadAppointments();
    } catch (_error) {
      toast.error("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

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
                  <p className="text-sm font-semibold mt-1 text-foreground">{format(new Date(apt.start_time), 'PPpp')}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className={`text-sm inline-block px-3 py-1 font-medium rounded-full ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {apt.status}
                  </div>
                  {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                    >
                      {cancellingId === apt.id ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
