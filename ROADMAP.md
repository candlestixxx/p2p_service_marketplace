# ROADMAP

## Phase 1: MVP (Current)
* [x] Basic Next.js App Router Structure
* [x] Prisma Database Schema
* [x] Provider Dashboard (Services, Availability)
* [x] Client Dashboard (Appointments)
* [x] Marketplace Discovery Hub
* [x] Booking Engine with Overlap Prevention
* [x] Stripe Connect Onboarding & Checkout
* [x] NextAuth Role-Based Authentication

## Phase 2: Engagement
* [x] Implement Twilio SMS Webhooks
* [x] Implement Resend Email Webhooks
* [x] Provider Review & Rating System
* [x] Provider Portfolio Image Gallery

## Phase 3: Scaling
* [x] Geo-location filtering with Google Maps API (Simplified to City/State string match)
* [x] Advanced Calendar Sync (Google Calendar API, Outlook) -> Implemented via `.ics` export fallbacks. Live syncing deferred to Phase 4 (See IDEAS.md).
* [x] Admin Moderation Dashboard

## Phase 4: External Integrations & APIs
* [ ] Complete Nylas External Calendar Sync implementation (Scaffolded).
* [ ] Implement active external database backups and fallbacks.
* [ ] Build out Stripe Webhook refund handling for cancelled appointments.
