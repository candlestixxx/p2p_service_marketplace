"use client";
import { RescheduleDialog } from "@/components/RescheduleDialog";

import { useEffect, useState } from "react";
import { getClientAppointments, cancelAppointment, createReview } from "@/actions/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Appointment, Service, User, Review } from "@prisma/client";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AppointmentWithDetails = Appointment & { service: Service, provider: User, review: Review | null };

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [reviewApptId, setReviewApptId] = useState<string | null>(null);
  const [rating, setRating] = useState<string>("5");
  const [comment, setComment] = useState("");

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

  const handleReviewSubmit = async () => {
     if (!reviewApptId) return;

     try {
       await createReview(reviewApptId, parseInt(rating, 10), comment);
       toast.success("Review submitted successfully!");
       setReviewApptId(null);
       setRating("5");
       setComment("");
       await loadAppointments();
     } catch (e: unknown) {
       toast.error((e as Error).message || "Failed to submit review");
     }
  };

  const now = new Date();

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
            {appointments.map((apt) => {
              const isPast = new Date(apt.end_time) < now;
              const canReview = apt.status === 'CONFIRMED' && isPast && !apt.review;

              return (
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
                    {(!isPast && (apt.status === 'PENDING' || apt.status === 'CONFIRMED')) && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/api/appointments/${apt.id}/ics`} download>
                             <CalendarDays className="w-4 h-4 mr-2" /> Add to Calendar
                          </a>
                        </Button>
                        <RescheduleDialog
                          appointmentId={apt.id}
                          serviceId={apt.serviceId}
                          currentStartTime={apt.start_time}
                          onSuccess={loadAppointments}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === apt.id}
                          onClick={() => handleCancel(apt.id)}
                        >
                          {cancellingId === apt.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      </div>
                    )}
                    {canReview && (
                      <Dialog open={reviewApptId === apt.id} onOpenChange={(open) => !open && setReviewApptId(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setReviewApptId(apt.id)}>Leave Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Leave a Review</DialogTitle>
                            <DialogDescription>
                              How was your appointment for {apt.service.title}?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="rating">Rating (1-5)</Label>
                              <Select value={rating} onValueChange={setRating}>
                                <SelectTrigger id="rating">
                                  <SelectValue placeholder="Select a rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5 - Excellent</SelectItem>
                                  <SelectItem value="4">4 - Very Good</SelectItem>
                                  <SelectItem value="3">3 - Average</SelectItem>
                                  <SelectItem value="2">2 - Poor</SelectItem>
                                  <SelectItem value="1">1 - Terrible</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="comment">Comment (Optional)</Label>
                              <Input
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your review here..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleReviewSubmit}>Submit Review</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {apt.review && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                         <span className="text-yellow-500">★</span> {apt.review.rating}/5
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
