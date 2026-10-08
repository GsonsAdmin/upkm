# Production Serial Tracking

Production serial-number traceability system for GSONS manufacturing operations.

## Initial scope

- Brand serial master imported from supplied PDF/serial list
- Production batch management
- Mobile camera QR scanning as the current test scan device
- USB HID 2D barcode scanner support planned for production stations
- First-scan validation and production counting
- Duplicate and invalid scan rejection
- Sequence-gap detection
- Operator, line, station, date/time and scan audit trail
- Lost/damaged sticker exception workflow
- End-of-batch reconciliation
- Supervisor and operator dashboards
- Supabase database + realtime updates
- Vercel deployment

## Stack

- Next.js / React / TypeScript
- Supabase
- Vercel

## Environment variables

Create `.env.local` from `.env.example` and add the Supabase project URL and publishable key. Never commit secrets.

## Deployment

Mobile-camera scanning is the current test workflow. The main branch is connected to Vercel for automatic deployments.
