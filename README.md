# Kokoro — Email Reminder Service

Kokoro lets users schedule reminders which are saved in MongoDB and delivered by email at the scheduled time using BullMQ + Redis and the Resend API.

## Quick Start (development)

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` in the project root and set required environment variables (see list below).

3. Run the Next.js app:

```bash
npm run dev
```

4. In a separate terminal run the worker (processes scheduled jobs and sends email):

```bash
npm run worker
```

## Required environment variables

- `MONGODB_URI` — MongoDB connection string. Include database name in the URI, e.g. `.../kokoro?retryWrites=true&w=majority`.
- `REDIS_URL` — Redis URL (Upstash or `redis://localhost:6379`).
- `RESEND_API_KEY` — Resend API key.
- `NEXT_PUBLIC_APP_URL` — App base URL (e.g. `http://localhost:3000`).
- Clerk keys if required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

Optional useful envs exist in `.env.local` (e.g. `BULLMQ_CONCURRENCY`, `BULLMQ_QUEUE_NAME`).

## How it works

- User creates a reminder via the UI → saved to MongoDB with status `pending`.
- A BullMQ delayed job is scheduled in Redis (`lib/queue.ts`).
- A separate worker process (`scripts/worker.ts` → `services/scheduler.ts`) processes jobs when due:
  - sends email via `services/email.tsx`
  - updates reminder status to `sent` or `failed`
  - creates and queues the next reminder for recurring items

## Troubleshooting

- Emails not delivered
  - Ensure `npm run worker` is running (jobs stay in Redis until a worker processes them).
  - Verify `RESEND_API_KEY` is valid; use `onboarding@resend.dev` as a test `from` address if needed.

- Jobs queued but not processed
  - Verify `REDIS_URL` is correct and reachable. Check `lib/redis.ts` logs.
  - Confirm worker logs for Redis connection errors (timeouts, auth errors).

- Worker fails with missing envs
  - `scripts/worker.ts` loads `.env.local` at startup; ensure the file is present and readable.

## Useful commands

```bash
# Run dev server
npm run dev

# Run worker (separate terminal)
npm run worker

# Install dependencies
npm install

# Show npm scripts
npm run
```

## Key files

- `app/api/reminders` — API routes for reminders
- `lib/db.ts` — MongoDB connection
- `lib/queue.ts` — BullMQ helpers (schedule / remove / update jobs)
- `lib/redis.ts` — Redis connection and config
- `services/scheduler.ts` — Job processor (sends emails)
- `services/email.tsx` — Resend client and email template
- `scripts/worker.ts` — Worker entrypoint (loads `.env.local` then starts worker)
