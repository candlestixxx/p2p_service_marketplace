"use client";

import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, getAllServices, deleteService } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Service } from "@prisma/client";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<(Service & { provider: User })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      const servicesData = await getAllServices();
      setUsers(usersData);
      setServices(servicesData);
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

    </div>
  );
}
