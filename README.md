# Production Serial Tracking

Production serial-number traceability system for GSONS manufacturing operations.

## Initial scope

- Brand serial master imported from supplied PDF/serial list
- Production batch management
- USB HID 2D barcode scanner as the primary scan device
- Optional camera QR scanner
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
