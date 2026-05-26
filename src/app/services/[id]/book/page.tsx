"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getServiceDetails } from "@/actions/marketplace";
import { getProviderAvailabilityForService, bookAppointment } from "@/actions/booking";
import { createCheckoutSession } from "@/actions/payment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, addDays, startOfToday } from "date-fns";
import { Service, User } from "@prisma/client";

type ServiceWithProvider = Service & { provider: User };

export default function BookServicePage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const searchParams = useSearchParams();

  const [service, setService] = useState<ServiceWithProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [availableSlots, setAvailableSlots] = useState<{start: Date, end: Date}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment successful! Your appointment is confirmed.");
    }
    if (searchParams.get("canceled")) {
      toast.error("Payment was canceled.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadService() {
      const data = await getServiceDetails(id);
      if (data) setService(data);
    }
    loadService();
  }, [id]);

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await getProviderAvailabilityForService(id, dateStr);
        setAvailableSlots(res.availableSlots);
      } catch (_error) {
        toast.error("Failed to load availability.");
      }
      setLoadingSlots(false);
    }
    if (service) {
      loadSlots();
    }
  }, [id, selectedDate, service]);

  const handleBook = async (slotStart: Date) => {
    setBooking(true);
    try {
      const { url } = await createCheckoutSession(id, slotStart);
      if (url) {
        window.location.href = url;
      }
    } catch (_error) {
      toast.error("Failed to initiate checkout. Check your auth status or if the provider is fully onboarded.");
    }
    setBooking(false);
  };

  if (!service) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-4xl w-full grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>{service.provider.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <div className="flex justify-between font-medium">
                <span>Price:</span>
                <span>${service.price}</span>
              </div>
              <div className="flex justify-between font-medium mt-2">
                <span>Duration:</span>
                <span>{service.duration_minutes} mins</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select a Date & Time</CardTitle>
              <CardDescription>Choose an available slot for your appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const date = addDays(startOfToday(), offset);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <Button
                      key={offset}
                      variant={isSelected ? "default" : "outline"}
                      className="flex-col h-auto py-2 px-4 shrink-0"
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="text-xs font-normal">{format(date, 'EEE')}</span>
                      <span className="text-lg font-bold">{format(date, 'd')}</span>
                    </Button>
                  );
                })}
              </div>

              <div>
                <h3 className="font-medium mb-4">Available Times on {format(selectedDate, 'MMMM d, yyyy')}</h3>
                {loadingSlots ? (
                  <p className="text-muted-foreground text-sm">Loading slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No availability on this date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        disabled={booking}
                        onClick={() => handleBook(slot.start)}
                        className="w-full"
                      >
                        {format(slot.start, 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
