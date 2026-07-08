# TODO

## Immediate Fixes
* [x] Review `src/actions/admin.ts` to ensure the `getAdminPlatformAnalytics` strictly memoizes or caches the results, as this queries all appointments on load.

## Short-term Features
* [x] Implement an automated Cron Job / Serverless endpoint that checks for appointments happening in the next 24 hours and triggers a reminder SMS/Email.
* [x] Integrate generic page view analytics (Vercel Web Analytics).

## Notes
Everything tracked in the immediate roadmap has been resolved.
