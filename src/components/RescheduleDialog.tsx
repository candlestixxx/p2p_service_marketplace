"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProviderAvailabilityForService } from "@/actions/booking";
import { rescheduleAppointment } from "@/actions/client";

interface RescheduleDialogProps {
  appointmentId: string;
  serviceId: string;
  currentStartTime: Date;
  onSuccess: () => void;
}

export function RescheduleDialog({ appointmentId, serviceId, currentStartTime, onSuccess }: RescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [availableSlots, setAvailableSlots] = useState<{start: Date, end: Date}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedDate(startOfToday());
    }
  }, [open]);

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await getProviderAvailabilityForService(serviceId, dateStr);
        setAvailableSlots(res.availableSlots);
      } catch (_error) {
        toast.error("Failed to load availability.");
      }
      setLoadingSlots(false);
    }
    if (open) {
      loadSlots();
    }
  }, [serviceId, selectedDate, open]);

  const handleReschedule = async (slotStart: Date) => {
    setRescheduling(true);
    try {
      await rescheduleAppointment(appointmentId, slotStart);
      toast.success("Appointment rescheduled successfully!");
      setOpen(false);
      onSuccess();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to reschedule.");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Reschedule</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Current Time: {format(new Date(currentStartTime), 'PPpp')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <h3 className="font-medium mb-4 text-sm">Available Times on {format(selectedDate, 'MMMM d, yyyy')}</h3>
            {loadingSlots ? (
              <p className="text-muted-foreground text-sm">Loading slots...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm">No availability on this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                {availableSlots.map((slot, idx) => {
                  const isCurrentSlot = new Date(slot.start).getTime() === new Date(currentStartTime).getTime();
                  return (
                    <Button
                      key={idx}
                      variant={isCurrentSlot ? "secondary" : "outline"}
                      disabled={rescheduling || isCurrentSlot}
                      onClick={() => handleReschedule(slot.start)}
                      className="w-full text-xs"
                    >
                      {format(slot.start, 'h:mm a')}
                      {isCurrentSlot && " (Current)"}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
