# ServiceHub

ServiceHub is a powerful two-sided marketplace (an "Uber for Services") that seamlessly connects clients with service providers.

This platform was built leveraging a modern tech stack to handle discovery, real-time availability scheduling, authentication, and secure payments via Stripe Connect.

## Core Features
*   **Role-based Authentication**: NextAuth.js secures the platform, providing distinct experiences for `CLIENT` and `PROVIDER` roles.
*   **Provider Dashboards**: Professionals can manage their service offerings, define weekly availability schedules, update geographical tracking data, and securely link their Stripe accounts for payouts.
*   **Client Dashboards**: Customers have a dedicated portal to review their upcoming and past bookings.
*   **Geographical Search**: A dynamic discovery marketplace allows clients to find providers by service keywords, city, or zip code.
*   **Smart Scheduling Engine**: Real-time logic cross-references provider hours with existing appointments—including custom pre/post-appointment buffer times—to guarantee conflict-free bookings.
*   **Stripe Connect Integration**: Embedded payment processing handles platform fees seamlessly, holding appointments in escrow via webhooks.

## Tech Stack
*   **Framework**: Next.js 15 (App Router)
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: NextAuth.js (Auth.js v5) with `bcryptjs`
*   **Payments**: Stripe Connect
*   **UI / Styling**: Tailwind CSS v4, shadcn/ui, `react-hook-form`, Zod
*   **Calendar**: `react-big-calendar`, `date-fns`

## Getting Started
To spin up a local development environment:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Configure your environment variables in `.env` based on `.env.example`. You will need database URLs and Stripe keys.
4. Run `npx prisma db push` to generate the database schema.
5. Run `npx prisma db seed` to instantly populate the database with demo providers, clients, services, and bookings.
6. Run `npm run dev` to start the Next.js server.
