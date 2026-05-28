"use client";

import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, getAllServices, deleteService, getAdminPlatformAnalytics, getAllReviews, deleteReview } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, LayoutList, DollarSign, Wallet, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Service } from "@prisma/client";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<(Service & { provider: User })[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [analytics, setAnalytics] = useState<{totalUsers: number, totalServices: number, totalGMV: number, platformFees: number} | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      const servicesData = await getAllServices();
      const analyticsData = await getAdminPlatformAnalytics();
      const reviewsData = await getAllReviews();
      setUsers(usersData);
      setServices(servicesData);
      setAnalytics(analyticsData);
      setReviews(reviewsData);
    } catch (e) {
      toast.error("Failed to load admin data. Are you an Admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user and all their data?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted.");
      loadData();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to delete user.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted.");
      loadData();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to delete review.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this service?")) return;
    try {
      await deleteService(id);
      toast.success("Service deleted.");
      loadData();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to delete service.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Moderation Dashboard</h2>
        <p className="text-muted-foreground">Manage users, providers, and active marketplace listings.</p>
      </div>

      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform GMV</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalGMV.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">lifetime gross volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.platformFees.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">lifetime 10% capture</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <LayoutList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalServices}</div>
              <p className="text-xs text-muted-foreground">marketplace listings</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users Directory</CardTitle>
          <CardDescription>All registered clients, providers, and admins.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{u.name || "Unknown"} <span className="text-xs ml-2 text-muted-foreground uppercase border px-2 rounded-full">{u.role}</span></p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                {u.role !== "ADMIN" && (
                   <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                )}
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Services</CardTitle>
          <CardDescription>All marketplace service listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">Provider: {s.provider.name} | Price: ${s.price}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteService(s.id)}>Remove Listing</Button>
              </div>
            ))}
             {services.length === 0 && <p className="text-sm text-muted-foreground">No services found.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Reviews</CardTitle>
          <CardDescription>All client reviews left on provider services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-medium">{r.client.name || "Unknown Client"}</span>
                     <span className="text-xs text-muted-foreground border px-2 rounded-full">to {r.provider.name}</span>
                     <span className="flex items-center text-sm font-semibold text-yellow-500">
                       {r.rating} <Star className="w-3 h-3 fill-yellow-400 ml-0.5" />
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Service: {r.appointment.service.title}</p>
                  {r.comment && <p className="text-sm italic text-muted-foreground">&quot;{r.comment}&quot;</p>}
                </div>
                <Button variant="ghost" className="text-destructive hover:bg-destructive hover:text-white" size="sm" onClick={() => handleDeleteReview(r.id)}>Delete</Button>
              </div>
            ))}
             {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews found.</p>}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
