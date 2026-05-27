# TODO

## Immediate Fixes
* [x] Fix Tailwind v4 Config Mapping: explicitly bind `tailwind.config.js` to `globals.css` or migrate the standard shadcn CSS variables to `@theme` directives to ensure colors map properly.
* [x] Refactor `isRedirectError` import: Change the internal import path in `src/actions/auth.ts` to `import { isRedirectError } from "next/navigation"` once framework supports it stably without build error.
* [x] Replace dummy Stripe fallback keys (`sk_test_12345`) with a rigorous environment check that throws an error if missing during production builds.

## Short-term Features
* [ ] Wire up real Twilio account SID/Token to the mock notification service.
* [x] Implement basic pagination on the Marketplace discovery hub.
* [ ] Create an "Edit Appointment" flow allowing clients to request a reschedule.
