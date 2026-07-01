# Structural Map — ServiceHub Marketplace (v1.1.34)

## Overview
This document maps all source modules, their locations, and key architectural relationships.

## Repository Layout

```
p2p_service_marketplace/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── api/
│   │   │   ├── webhook/
│   │   │   │   ├── stripe/route.ts   # Stripe webhook (payment capture)
│   │   │   │   ├── nylas/route.ts    # Nylas webhook (calendar sync)
│   │   │   │   └── paypal/route.ts   # PayPal webhook (order capture)
│   │   │   └── algolia/sync/route.ts # Algolia index sync endpoint
│   │   ├── appointments/[id]/ics/    # ICS calendar export for bookings
│   │   ├── auth/                     # Login/Register NextAuth routes
│   │   ├── dashboard/
│   │   │   ├── admin/               # Admin moderation & analytics
│   │   │   ├── client/              # Client dashboard (appointments, profile)
│   │   │   ├── messages/            # In-app messaging system
│   │   │   └── provider/            # Provider dashboard (services, availability, calendar, payments)
│   │   ├── services/                # Marketplace discovery hub
│   │   │   ├── [id]/book/           # Booking page
│   │   │   └── [id]/success/        # Post-checkout confirmation
│   │   └── provider/[id]/           # Public provider profiles
│   ├── actions/                     # Server actions (business logic)
│   │   ├── auth.ts                  # Authentication actions
│   │   ├── admin.ts                 # Admin moderation actions
│   │   ├── booking.ts               # Booking engine (slot generation, overlap prevention)
│   │   ├── calendar.ts              # Nylas calendar sync actions
│   │   ├── client.ts                # Client dashboard actions
│   │   ├── marketplace.ts           # Marketplace discovery actions
│   │   ├── messaging.ts             # In-app chat server actions
│   │   ├── payment.ts               # Stripe & PayPal payment processing
│   │   ├── provider.ts              # Provider dashboard actions
│   │   └── __tests__/
│   │       └── booking.nylas.test.ts
│   ├── components/                  # Reusable UI components (shadcn/ui)
│   ├── lib/                         # Utility libraries
│   │   ├── algolia.ts               # Algolia search client
│   │   ├── nylas.ts                 # Nylas SDK client
│   │   ├── notifications.ts         # Twilio/Resend notification service
│   │   ├── paypal.ts                # PayPal SDK client
│   │   ├── prisma.ts                # Prisma ORM client singleton
│   │   └── stripe.ts                # Stripe SDK client
│   └── middleware.ts                # Route protection middleware
├── prisma/
│   ├── schema.prisma                # Database schema (User, Service, Appointment, Message, etc.)
│   ├── seed.ts                      # Demo data seeder
│   └── migrations/                  # Prisma migrations
├── __tests__/                       # Root integration tests
│   └── integration.test.ts
├── .github/workflows/
│   └── test.yml                     # CI pipeline (TypeScript check + Jest tests)
├── .env                             # Environment config (not committed)
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config
├── next.config.ts                   # Next.js configuration
└── tailwind.config.js               # Tailwind CSS configuration

## Governance Documents
| File | Purpose |
|------|---------|
| VERSION.md | Central version authority (1.1.34) |
| CHANGELOG.md | Feature release history |
| HANDOFF.md | Session handoff & architecture map |
| ROADMAP.md | Phase-based feature roadmap |
| TODO.md | Immediate fixes & short-term features |
| DEPLOY.md | Deployment & CI/CD instructions |
| README.md | Project overview & quick start |
| STRUCTURAL_MAP.md | This file - module layout |

## No Submodules
This repository has no git submodules. All code is contained directly in this repository.

## Remote Origin
- **Fetch/Push URL**: https://github.com/candlestixxx/p2p_service_marketplace.git
- **Default Branch**: main

## Active Branches
| Branch | Status |
|--------|--------|
| main | Latest (v1.1.34) |
| jules-8999598513845091996-64c48c3e | Reverse-merged from main |
| jules-11618208320087535291-bedf8744 | Reverse-merged from main |
| servicehub-marketplace-mvp-11017081671621905486 | Reverse-merged from main |
