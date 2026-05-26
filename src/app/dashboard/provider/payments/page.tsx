"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkStripeConnectStatus, createStripeConnectLink } from "@/actions/payment";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function PaymentsPage() {
  const [isLinked, setIsLinked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await checkStripeConnectStatus();
        setIsLinked(status);
      } catch (_error) {
        toast.error("Failed to fetch Stripe status");
      }
      setLoading(false);
    }
    loadStatus();
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const url = await createStripeConnectLink();
      window.location.href = url;
    } catch (_error) {
      toast.error("Failed to start Stripe Connect onboarding");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading payment settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Manage your payout account and track earnings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLinked ? (
          <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Stripe Connected</h3>
              <p className="text-sm text-green-700 dark:text-green-400">Your account is fully set up to receive payouts.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Action Required</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">You must connect a Stripe account to accept bookings and receive payouts.</p>
              </div>
            </div>
            <Button onClick={handleConnect} className="w-fit">Connect Stripe</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
