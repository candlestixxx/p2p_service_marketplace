"use client";

import { useEffect, useState } from "react";
import { getClientAnalytics } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CalendarClock, UserCheck, Activity, Info } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ClientDashboardPage() {
  const [data, setData] = useState<{ totalSpent: number, upcomingAppointments: number, totalBookings: number, confirmedBookings: number, favoriteProvider: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getClientAnalytics();
        setData(result);
      } catch (e) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">No data available.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Client Overview</h2>
        <p className="text-muted-foreground">Welcome to your dashboard. Track your spending and upcoming services.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                 Total Spent
                 <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>Total monetary value of all your confirmed bookings on ServiceHub.</TooltipContent>
                 </Tooltip>
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">lifetime across all bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                 Upcoming Appointments
                 <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>The number of confirmed appointments that have not yet occurred.</TooltipContent>
                 </Tooltip>
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">scheduled for the future</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                 Total Bookings
                 <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>Your total booking history, including pending and completed services.</TooltipContent>
                 </Tooltip>
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalBookings}</div>
              <p className="text-xs text-muted-foreground">{data.confirmedBookings} confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                 Top Provider
                 <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>The service provider you have booked the most frequently.</TooltipContent>
                 </Tooltip>
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{data.favoriteProvider}</div>
              <p className="text-xs text-muted-foreground">your most booked service</p>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    </div>
  );
}
