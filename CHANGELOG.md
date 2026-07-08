# Changelog

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
