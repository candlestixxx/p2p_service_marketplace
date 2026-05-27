"use client";

import { useEffect, useState } from "react";
import { getProviderAppointments, updateAppointmentStatus } from "@/actions/provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Appointment, Service, User } from "@prisma/client";
import { toast } from "sonner";

type AppointmentWithDetails = Appointment & { service: Service, client: User };

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const data = await getProviderAppointments();
      setAppointments(data as AppointmentWithDetails[]);
    } catch (_error) {
       toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId: string, status: "CONFIRMED" | "CANCELLED") => {
    if (status === "CANCELLED" && !confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setUpdatingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      await loadAppointments();
    } catch (_error) {
      toast.error(`Failed to ${status.toLowerCase()} appointment`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment List</CardTitle>
        <CardDescription>Manage your incoming service requests and bookings.</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Client: {apt.client.name}</p>
                  <p className="text-sm font-semibold mt-1 text-foreground">{format(new Date(apt.start_time), 'PPpp')}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className={`text-sm inline-block px-3 py-1 font-medium rounded-full ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {apt.status}
                  </div>
                  {apt.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === apt.id}
                          onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updatingId === apt.id}
                          onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                        >
                          Decline
                        </Button>
                    </div>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/appointments/${apt.id}/ics`} download>
                           <CalendarDays className="w-4 h-4 mr-2" /> Add to Calendar
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                      disabled={updatingId === apt.id}
                      onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </div>
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
