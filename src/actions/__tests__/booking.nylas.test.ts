import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

import { getProviderAvailabilityForService } from "../booking";
import { prisma } from "../../lib/prisma";
import Nylas from 'nylas';

jest.mock("../../lib/prisma", () => {
   return {
     prisma: {
       service: {
         findUnique: jest.fn().mockResolvedValue({
           id: "service_id_1",
           providerId: "prov_id_1",
           duration_minutes: 30,
           buffer_minutes: 0,
           provider: {
             nylasGrantId: "grant_id_1",
             email: "provider@example.com"
           }
         })
       },
       availability: {
         findFirst: jest.fn().mockResolvedValue({
           start_time: "09:00",
           end_time: "10:00",
         })
       },
       appointment: {
         findMany: jest.fn().mockResolvedValue([])
       }
     }
   }
});

jest.mock("nylas");

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

jest.mock("../../auth", () => ({
  auth: jest.fn()
}));

describe("booking Nylas integration", () => {
   beforeEach(() => {
     process.env.NYLAS_API_KEY = "dummy_key";
     jest.clearAllMocks();
   });

   it("should fetch free busy and subtract from slots", async () => {
      (Nylas as any).mockImplementation(() => {
         return {
            calendars: {
               getFreeBusy: jest.fn().mockResolvedValue({
                  data: [{
                     object: "free_busy",
                     timeSlots: [{
                        status: "busy",
                        startTime: new Date("2023-01-01T09:15:00.000Z").getTime() / 1000,
                        endTime: new Date("2023-01-01T09:45:00.000Z").getTime() / 1000,
                     }]
                  }]
               })
            }
         }
      });
      const result = await getProviderAvailabilityForService("service_id_1", "2023-01-01");
      expect(result.availableSlots).toHaveLength(0); // 9-9:30 overlaps with 9:15-9:45, 9:30-10:00 overlaps too
   });

   it("should return empty slots when totally available", async () => {
      (Nylas as any).mockImplementation(() => {
         return {
            calendars: {
               getFreeBusy: jest.fn().mockResolvedValue({
                  data: []
               })
            }
         }
      });
      const result = await getProviderAvailabilityForService("service_id_1", "2023-01-01");
      expect(result.availableSlots).toHaveLength(2); // 9:00, 9:30
   });
});
