import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getServiceDetails } from "@/actions/marketplace";

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const service = await getServiceDetails(resolvedParams.id);

  if (!service) {
    return <div className="p-8 text-center text-muted-foreground">Service not found.</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full text-center border-green-200">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your appointment has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-left">
            <h3 className="font-semibold text-foreground">Service Details</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Provider:</strong> {service.provider.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Service:</strong> {service.title}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Duration:</strong> {service.duration_minutes} minutes
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/client/appointments">View My Appointments</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/services">Browse More Services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
