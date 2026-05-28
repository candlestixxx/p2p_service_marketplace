# ServiceHub (v1.0.0)

ServiceHub is a comprehensive "Uber for Services" two-sided marketplace. It connects Service Providers (supply) with Clients (demand) using a highly robust architecture built on Next.js 15, Prisma, PostgreSQL, NextAuth, and Stripe Connect.

## Core Architecture
- **Marketplace Discovery**: Location-based search (`city`, `state`, `zip_code`) allowing clients to find top-rated providers in their area.
- **Provider Dashboards**: Providers can list unlimited services, upload portfolio images, manage Custom Weekly Availability, and view a unified Visual Calendar map of their bookings.
- **Client Dashboards**: Clients can view past and upcoming appointments, leave public Star Reviews, and dynamically download `.ics` calendar files for personal sync.
- **The Booking Engine**: Automatically parses a provider's custom schedule, calculates 30-minute time slots, and cross-references existing bookings and prep-buffers to calculate real-time available slots, mathematically preventing double-booking overlaps.
- **Escrow Payments**: Integrated with Stripe Connect. Payments are captured up-front upon booking and routed directly to the Provider's express dashboard.
- **Pro Subscriptions**: Standard providers pay a 10% platform fee per booking. Providers can upgrade to "PRO" to waive the fee entirely and earn distinct verification badges.
- **Real-Time Polling**: Dashboards feature Vercel-friendly 15-second polling intervals to simulate WebSockets, auto-populating new bookings without user refresh.
- **Admin Moderation**: Highly secure `ADMIN` role dashboard tracking Platform Lifetime GMV, active users, and providing 1-click removal of malicious service listings.
- **Notifications**: Integrated Twilio SMS and Resend Email SDKs for instant appointment booking and cancellation receipts.

## Quick Start
1. `npm install`
2. Configure `.env` with your Postgres `DATABASE_URL` and Stripe keys.
3. `npx prisma db push`
4. `npx prisma db seed` (Generates test providers, clients, and services)
5. `npm run dev`

Read `IDEAS.md` and `HANDOFF.md` for information on upcoming integration pipelines (Nylas Calendar Sync).
