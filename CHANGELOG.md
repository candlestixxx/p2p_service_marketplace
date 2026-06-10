# Changelog

## [1.0.4] - Comprehensive Repo Sync & Integration Suite
- **Core Sync**: Executed dual-direction intelligent merge engine, reconciling `main` and all local AI feature branches.
- **Testing**: Built `__tests__/integration.test.ts` to programmatically validate repository health and turbopack build processes.

## [1.0.3] - Nylas Scaffold Implementations
- **Integrations**: Fully scaffolded Nylas SDK connection inside `src/actions/calendar.ts`.
- **Infrastructure**: Added `nylas` package to dependencies to continue integration buildout.

## [1.0.2] - Upstream Sync & Integrations
- **Core Strategy**: Successfully executed upstream recursive sync.
- **Merge Reconciliation**: Intelligently merged `origin/main` upstream features (such as `Nylas` external calendar scaffolding) directly into local feature branches.

## [1.0.1] - Analytics & Admin Expansion
- **Real-Time Polling**: Implemented a 15-second polling interval on Dashboards.
- **Analytics Dashboards**: Added statistical UI representations (Lifetime revenue, top providers) in root dashboard routes.
- **Monetization Expansion**: Subscriptions added (`isPro`), waiving the 10% platform fee for active PRO users.
- **Category Taxonomy**: Refactored Service Discovery to parse explicit Prisma service categories.
- **Admin Moderation**: Added UI tooling to monitor user accounts, services, and manually delete abusive client reviews.

## [1.0.0] - MVP Completion
- **Calendar Sync**: Added `.ics` file generation and download capabilities for confirmed appointments.
- **Admin**: Introduced `ADMIN` role, `/dashboard/admin` route, and role-based middleware logic.
- **Geography**: Enabled string-matching search indexing (`city`, `state`, `zip_code`) for the `/services` discovery endpoint.
- **Provider Portfolios**: Implemented dynamic portfolio image galleries (`useFieldArray`) and visual avatars.
- **Client Features**: Shipped dynamic `RescheduleDialog` and Review/Rating submission flow.
- **Integrations**: Integrated Twilio SMS and Resend Email notification SDKs for checkout confirmations.
- **Stripe**: Hardened Webhook Escrow flows and API versions.
