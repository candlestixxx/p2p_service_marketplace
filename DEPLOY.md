# DEPLOYMENT
## Local Development
1. `npm install`
2. Configure `.env` with `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AUTH_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, and `RESEND_API_KEY`.
3. `npx prisma db push` or `npx prisma migrate dev`
4. `npm run dev`
## Production
Ensure `@prisma/client` is in standard `dependencies`. Build with `npm run build` and run with `npm start`. Set environment variables accordingly.
