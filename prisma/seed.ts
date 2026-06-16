import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, setHours, setMinutes, startOfToday } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create a Provider
  const provider = await prisma.user.create({
    data: {
      email: "provider@demo.com",
      name: "Demo Professional",
      role: "PROVIDER",
      password: passwordHash,
      stripeConnectLinked: true,
      stripeAccountId: "acct_demo123", // Dummy Stripe account for testing
    },
  });

  // 2. Create Services
  const service1 = await prisma.service.create({
    data: {
      providerId: provider.id,
      title: "1-Hour Consultation",
      description: "A comprehensive one-on-one session to discuss your needs.",
      price: 150.0,
      duration_minutes: 60,
      buffer_minutes: 15,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      providerId: provider.id,
      title: "Quick Sync (30 min)",
      description: "A fast check-in or follow-up meeting.",
      price: 75.0,
      duration_minutes: 30,
      buffer_minutes: 0,
    },
  });

  // 3. Create Availability (Mon-Fri, 9am - 5pm)
  const availabilities = [];
  for (let i = 1; i <= 5; i++) {
    availabilities.push({
      providerId: provider.id,
      day_of_week: i,
      start_time: "09:00",
      end_time: "17:00",
    });
  }
  await prisma.availability.createMany({
    data: availabilities,
  });

  // 4. Create a Client
  const client = await prisma.user.create({
    data: {
      email: "client@demo.com",
      name: "Demo Client",
      role: "CLIENT",
      password: passwordHash,
    },
  });

  // 5. Create some Appointments
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  // Helper to create date objects easily
  const createDate = (baseDate: Date, hours: number, minutes: number = 0) => {
    return setMinutes(setHours(baseDate, hours), minutes);
  };

  await prisma.appointment.createMany({
    data: [
      {
        clientId: client.id,
        providerId: provider.id,
        serviceId: service1.id,
        start_time: createDate(today, 10, 0),
        end_time: createDate(today, 11, 0),
        status: "CONFIRMED",
      },
      {
        clientId: client.id,
        providerId: provider.id,
        serviceId: service2.id,
        start_time: createDate(today, 14, 0),
        end_time: createDate(today, 14, 30),
        status: "PENDING",
      },
      {
        clientId: client.id,
        providerId: provider.id,
        serviceId: service1.id,
        start_time: createDate(tomorrow, 11, 0),
        end_time: createDate(tomorrow, 12, 0),
        status: "CONFIRMED",
      },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
