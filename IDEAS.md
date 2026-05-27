# Future Development Ideas & Architecture

## Advanced Calendar Sync (Google Calendar & Outlook)
Integrating external calendars is the primary hurdle for scaling a two-sided marketplace. If providers manage their schedules in Google Calendar or Outlook, they will inevitably double-book if our platform relies solely on its internal Prisma `Availability` tables.

### Proposed Architecture: Nylas API Integration
Rather than building separate OAuth 2.0 flows for Google, Microsoft, and Apple, the platform should integrate **Nylas** (or Cronofy).

1. **Provider Onboarding Update:**
   - In `src/app/dashboard/provider/profile/page.tsx`, add a "Connect External Calendar" button.
   - This triggers the Nylas Hosted Authentication flow.
   - Upon success, Nylas returns an `account_id` and `grant_id`. Store this in the Prisma `User` model (`nylasGrantId String?`).

2. **Booking Engine Rewrite (`src/actions/booking.ts`):**
   - When `getProviderAvailabilityForService` is called, check if the provider has a `nylasGrantId`.
   - If yes: make a live API call to `https://api.nylas.com/v3/calendars/free-busy`.
   - Nylas will query Google/Outlook in real-time. Subtract these busy blocks from our internally generated 30-minute time slots.

3. **Webhooks:**
   - Set up a Next.js API route (`src/app/api/webhook/nylas/route.ts`).
   - Listen for `event.created` and `event.deleted` from Nylas to keep our internal UI updated without constant polling.

### Alternate Approaches
- **Export Only (.ics) [IMPLEMENTED]:** Generates `.ics` files for every confirmed appointment allowing users to download them to external calendars.
- **Cal.com Open Source:** Fork and integrate `cal.com`'s core scheduling engine into our monorepo.

## UI/UX Polish
- **Websockets:** Implement Socket.io or Supabase Realtime to update the marketplace listings and dashboards the exact second a slot is booked, removing the need for page refreshes.
