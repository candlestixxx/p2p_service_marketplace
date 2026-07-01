# ServiceHub (v1.1.24)

ServiceHub is a comprehensive "Uber for Services" two-sided marketplace. It connects Service Providers (supply) with Clients (demand) using a highly robust architecture built on Next.js 15, Prisma, PostgreSQL, NextAuth, Algolia, and Stripe Connect.

## Core Architecture
- **Marketplace Discovery (Algolia)**: High-speed fuzzy search natively integrated via `algoliasearch` allowing clients to find top-rated providers in their area by location, category, or keyword.
- **Provider Dashboards**: Providers can list unlimited services, upload portfolio images, manage Custom Weekly Availability, and view a unified Visual Calendar map of their bookings.
- **Client Dashboards**: Clients can view past and upcoming appointments, leave public Star Reviews, and dynamically download `.ics` calendar files for personal sync.
- **Advanced Direct Messaging**: Native in-app chat utilizing 15-second polling intervals allows direct, context-aware communication between clients and providers.
- **The Booking Engine**: Automatically parses a provider's custom schedule, calculates 30-minute time slots, and cross-references existing bookings and prep-buffers to calculate real-time available slots, mathematically preventing double-booking overlaps.
- **External Calendar Sync**: Deep integration with the **Nylas V3 API**. Provider Google/Outlook calendars are checked dynamically during booking slot generation via `getFreeBusy` to definitively prevent platform-external double bookings. Secure webhooks (`/api/webhook/nylas`) automatically revalidate UI paths.
- **Escrow Payments & Automated Payouts**: Integrated with Stripe Connect. Payments are captured up-front upon booking via **Destination Charges**, routing platform fees to the main account and immediately transferring the balance to the Provider's express dashboard.
- **Pro Subscriptions**: Standard providers pay a 10% platform fee per booking. Providers can upgrade to "PRO" to waive the fee entirely and earn distinct verification badges.
- **Admin Moderation**: Highly secure `ADMIN` role dashboard tracking Platform Lifetime GMV, active users, and providing 1-click removal of malicious service listings and reviews.
- **Notifications**: Integrated Twilio SMS and Resend Email SDKs for instant appointment booking and cancellation receipts.

## Repository Governance
- **Automated CI/CD**: Pushes to `main` must pass rigorous continuous integration pipelines (`.github/workflows/test.yml`), strictly checking TypeScript (`npx tsc --noEmit`) and Jest unit/integration tests before deployment.
- **Documentation State**: Core architectural tracking is centralized across `ROADMAP.md`, `CHANGELOG.md`, `DEPLOY.md`, `HANDOFF.md`, and `VERSION.md`.

## Quick Start
1. `npm install`
2. Configure `.env` with your Postgres `DATABASE_URL`, Stripe, Nylas, and Algolia keys. (See `DEPLOY.md` for specifics).
3. `npx prisma db push`
4. `npx prisma db seed` (Generates test providers, clients, and services)
5. `npm run dev`
