"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { updateAvailability, getProviderAvailability } from "@/actions/provider";
import { useEffect } from "react";
import { toast } from "sonner";

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const daySchema = z.object({
  day_of_week: z.number(),
  is_active: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

const formSchema = z.object({
  availabilities: z.array(daySchema),
});

export default function AvailabilityPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availabilities: DAYS.map((_, index) => ({
        day_of_week: index,
        is_active: index >= 1 && index <= 5, // Default Mon-Fri active
        start_time: "09:00",
        end_time: "17:00",
      })),
    },
  });

  const { fields } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  useEffect(() => {
    async function load() {
      const dbAvailabilities = await getProviderAvailability();
      if (dbAvailabilities.length > 0) {
        const newValues = DAYS.map((_, index) => {
          const dbAvail = dbAvailabilities.find((a) => a.day_of_week === index);
          return {
            day_of_week: index,
            is_active: !!dbAvail,
            start_time: dbAvail?.start_time || "09:00",
            end_time: dbAvail?.end_time || "17:00",
          };
        });
        form.reset({ availabilities: newValues });
      }
    }
    load();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateAvailability(values.availabilities);
      toast.success("Availability updated successfully");
    } catch (_error) {
      toast.error("Failed to update availability");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          Set your weekly availability for clients to book appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`availabilities.${index}.is_active`}
                  render={({ field: checkboxField }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 w-32">
                      <FormControl>
                        <Checkbox
                          checked={checkboxField.value}
                          onCheckedChange={checkboxField.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {DAYS[index]}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch(`availabilities.${index}.is_active`) ? (
                  <>
                    <FormField
                      control={form.control}
                      name={`availabilities.${index}.start_time`}
                      render={({ field: timeField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...timeField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground">to</span>
                    <FormField
                      control={form.control}
                      name={`availabilities.${index}.end_time`}
                      render={({ field: timeField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...timeField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground py-2">Unavailable</div>
                )}
              </div>
            ))}
            <Button type="submit">Save Availability</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
