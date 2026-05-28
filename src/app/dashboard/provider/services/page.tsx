"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addService, getProviderServices, deleteProviderService } from "@/actions/provider";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Service } from "@prisma/client";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid positive number.",
  }),
  duration_minutes: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 5, {
    message: "Duration must be at least 5 minutes.",
  }),
  buffer_minutes: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Buffer time cannot be negative.",
  }),
});

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      price: "0",
      duration_minutes: "30",
      buffer_minutes: "0",
    },
  });

  const loadServices = async () => {
    const fetchedServices = await getProviderServices();
    setServices(fetchedServices);
  };

  useEffect(() => {
    loadServices();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addService({
        title: values.title,
        description: values.description || "",
        category: values.category || "Other",
        price: Number(values.price),
        duration_minutes: Number(values.duration_minutes),
        buffer_minutes: Number(values.buffer_minutes),
      });
      toast.success("Service added successfully");
      form.reset();
      loadServices();
    } catch (_error) {
      toast.error("Failed to add service");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service? It will remove it from the public marketplace.")) return;
    setDeletingId(id);
    try {
      await deleteProviderService(id);
      toast.success("Service deleted");
      loadServices();
    } catch (e) {
      toast.error("Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>
            Create a new service offering for your clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1 Hour Plumbing Consultation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Pet Care">Pet Care</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe what this service entails..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buffer_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer (Minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Add Service</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>A list of services you currently offer.</CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services added yet.</p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-medium">{service.title}</h3>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{service.category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-medium">${service.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.duration_minutes} mins (+{service.buffer_minutes} min buffer)
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive hover:text-white"
                      disabled={deletingId === service.id}
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
