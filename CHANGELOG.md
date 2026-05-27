# Changelog

## [1.0.0] - MVP Completion
- **Admin**: Introduced `ADMIN` role, `/dashboard/admin` route, and role-based middleware logic.
- **Geography**: Enabled string-matching search indexing (`city`, `state`, `zip_code`) for the `/services` discovery endpoint.
- **Provider Portfolios**: Implemented dynamic portfolio image galleries (`useFieldArray`) and visual avatars.
- **Client Features**: Shipped dynamic `RescheduleDialog` and Review/Rating submission flow.
- **Integrations**: Integrated Twilio SMS and Resend Email notification SDKs for checkout confirmations.
- **Stripe**: Hardened Webhook Escrow flows and API versions.
