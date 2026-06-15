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

Nylas webhooks are required to maintain external calendar synchronization. Ensure `/api/webhook/nylas` is properly registered with your Nylas application dashboard and the `NYLAS_WEBHOOK_SECRET` environment variable is configured for signature validation.

## Continuous Integration & Governance
The repository utilizes GitHub Actions to enforce code stability.
Any pushes or pull requests to the `main` branch will automatically trigger the CI workflow defined in `.github/workflows/test.yml`.
This workflow executes unit tests (`npm test`), TypeScript verification (`npx tsc --noEmit`), and ensures Prisma clients can be generated cleanly.
