# NexGenKlick Gamification

NexGenKlick Gamification is a school achievement tracking app that lets teachers award students points for accomplishments, students upload their own achievements, and parents view progress — all in real time. Students earn badges as they accumulate points, with animated celebrations when a new badge is unlocked. Built with Next.js 16 App Router, Tailwind CSS v4, React 19, and Supabase.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works fine)
- npm

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, navigate to **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and run it to create all tables and seed the badge data.
4. Optionally, paste and run `supabase/seed.sql` to populate three sample students with achievements and earned badges.

## Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your Supabase project URL and anon key (found in **Project Settings > API** in the Supabase dashboard):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key routes

| Route | Description |
|---|---|
| `/` | Landing page with links to all views |
| `/student/[id]` | Student profile — view achievements, badges, upload new achievements |
| `/parent/[studentId]` | Parent read-only view of student progress |
| `/admin` | Admin dashboard — manage students, add achievements, view charts |

Use the student IDs from your seeded data (or the UUIDs in `supabase/seed.sql`) for the `/student/` and `/parent/` routes. The landing page links to `/student/demo` and `/parent/demo` as placeholder routes.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the following environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel will automatically run `npm run build`.
