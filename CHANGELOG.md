# Changelog

## [1.1.34] - Final Expansion: PayPal, Messaging & Algolia
- **PayPal Integration**: Added secondary checkout route with PayPal Server SDK for dual payment options (Stripe/PayPal).
- **PayPal Webhooks**: Secure endpoint at `/api/webhook/paypal` for `CHECKOUT.ORDER.APPROVED` capture and appointment confirmation.
- **In-App Messaging**: Built full chat system with `Message` Prisma model, server actions, and 15-second polling UI.
- **Algolia Search**: Integrated `algoliasearch` for high-speed fuzzy search with automatic index sync on service CRUD.
- **Stripe Connect Verification**: Confirmed Destination Charges for automated platform fee routing.
- **CI/CD Governance**: GitHub Actions pipeline enforces TypeScript and Jest checks on push.

## [1.0.1] - Calendar Live Sync
- **Integrations**: Integrated Nylas for external calendar fetching, updating `src/actions/booking.ts` to block slots according to Google/Outlook availability.
- **Webhooks**: Added `/api/webhook/nylas` endpoint to handle real-time external event creations and deletions.
- **Tests**: Created test suite for Nylas `booking.nylas.test.ts`.

## [1.0.0] - MVP Completion
- **Calendar Sync**: Added `.ics` file generation and download capabilities for confirmed appointments.
- **Admin**: Introduced `ADMIN` role, `/dashboard/admin` route, and role-based middleware logic.
- **Geography**: Enabled string-matching search indexing (`city`, `state`, `zip_code`) for the `/services` discovery endpoint.
- **Provider Portfolios**: Implemented dynamic portfolio image galleries (`useFieldArray`) and visual avatars.
- **Client Features**: Shipped dynamic `RescheduleDialog` and Review/Rating submission flow.
- **Integrations**: Integrated Twilio SMS and Resend Email notification SDKs for checkout confirmations.
- **Stripe**: Hardened Webhook Escrow flows and API versions.
