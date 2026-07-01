import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarDays, Clock, MapPin, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getServiceDetails } from "@/actions/marketplace";
import { format } from "date-fns";

export default async function BookingSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paypal?: string, appointmentId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const service = await getServiceDetails(resolvedParams.id);

  if (!service) {
    return <div className="p-8 text-center text-muted-foreground">Service not found.</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 bg-muted/20">
      <Card className="mx-auto max-w-lg w-full border-green-200 shadow-lg animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-6 shadow-sm border border-green-200">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base mt-2">
            {resolvedSearch.paypal ? "Your PayPal order is processing. Check your email for confirmation." : "Your payment was successful and your appointment is scheduled."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">

          <div className="bg-muted/50 p-6 rounded-xl border space-y-4 text-left">
            <h3 className="font-semibold text-foreground text-lg border-b pb-2">Service Details</h3>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Provider</p>
                  <p className="text-sm text-muted-foreground">{service.provider.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Service Requested</p>
                  <p className="text-sm text-muted-foreground">{service.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Duration</p>
                  <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
                </div>
              </div>

              {(service.provider.city || service.provider.zip_code) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {service.provider.city}{service.provider.state ? `, ${service.provider.state}` : ''} {service.provider.zip_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/client/appointments">View My Schedule</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/services">Book Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
