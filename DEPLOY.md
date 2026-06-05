# DEPLOYMENT

## Local Development
1. `npm install`
2. Configure `.env` with required secrets: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AUTH_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, and `RESEND_API_KEY`.
3. Apply database schemas: `npx prisma migrate dev`
4. Optionally seed demo data: `npx prisma db seed`
5. Start development server: `npm run dev`

## Production & Staging Deployment (Vercel / VPS)
1. Ensure all `dependencies` and `devDependencies` are correctly separated in `package.json`. Next.js output standalone requires proper packaging.
2. Build the application: `npm run build`
3. Execute database migrations using Prisma deploy: `npx prisma migrate deploy`
4. Start the application: `npm start`
5. Ensure production environment variables are exactly mirroring the required local ones, and update API endpoints for webhooks if self-hosting.

## User Acceptance Testing (UAT)
1. Ensure mock or testing `.env` keys (e.g. `STRIPE_SECRET_KEY` starts with `sk_test`) are mapped onto the staging environment.
2. UAT Testers should create at least one Provider and one Client account.
3. Validate booking overlap logic by attempting to book the identical time slots.
4. Execute test payment transactions via Stripe using test cards (e.g., 4242 4242 4242 4242).

## Webhooks
Stripe webhooks are absolutely required for booking execution to complete.
Ensure `/api/webhook/stripe` is accessible on the deployed domain and configured within the Stripe Dashboard.
