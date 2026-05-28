"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, getProvider } from "@/actions/provider";
import { toggleProStatus } from "@/actions/pro";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(5, "Valid Zip Code required"),
  image: z.string().url().optional().or(z.literal("")),
  portfolioUrls: z.array(z.string().url("Must be a valid URL")).optional(),
});

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [togglingPro, setTogglingPro] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      state: "",
      zip_code: "",
      image: "",
      portfolioUrls: [],
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const user = await getProvider();
        setIsPro(user.isPro);
        form.reset({
          city: user.city || "",
          state: user.state || "",
          zip_code: user.zip_code || "",
          image: user.image || "",
          portfolioUrls: user.portfolioUrls || [],
        });
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "portfolioUrls" as never, // hack for zod array
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }

  if (loading) {
     return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const handleTogglePro = async () => {
    setTogglingPro(true);
    try {
       await toggleProStatus();
       setIsPro(!isPro);
       toast.success(`Successfully ${!isPro ? 'upgraded to PRO' : 'downgraded to Standard'}`);
    } catch(e) {
       toast.error("Failed to toggle Pro status");
    } finally {
       setTogglingPro(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="pb-4">
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Subscription Tier</CardTitle>
               <CardDescription>Manage your platform membership.</CardDescription>
             </div>
             {isPro ? (
               <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 py-1">PRO PLAN</Badge>
             ) : (
               <Badge variant="secondary" className="py-1">STANDARD PLAN</Badge>
             )}
           </div>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground mb-4">
             {isPro
               ? "You are currently enjoying PRO benefits. The 10% platform fee is entirely waived on all your bookings."
               : "Upgrade to PRO to waive the 10% platform fee on all bookings and receive a priority badge on your marketplace listings."}
           </p>
           <Button variant={isPro ? "outline" : "default"} onClick={handleTogglePro} disabled={togglingPro}>
             {togglingPro ? "Processing..." : isPro ? "Cancel Pro Subscription" : "Upgrade to Pro"}
           </Button>
        </CardContent>
      </Card>

    <Card>
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription>
          Set your geographical location so local clients can discover your services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="94105" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                 <div>
                   <FormLabel className="text-base">Portfolio Images</FormLabel>
                   <CardDescription>Add URLs to images showcasing your previous work.</CardDescription>
                 </div>
                 <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                    <Plus className="w-4 h-4 mr-2" /> Add Image
                 </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`portfolioUrls.${index}`}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="https://example.com/portfolio-image.jpg" {...inputField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive mt-1 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {fields.length === 0 && (
                 <p className="text-sm text-muted-foreground italic text-center py-2">No portfolio images added yet.</p>
              )}
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
