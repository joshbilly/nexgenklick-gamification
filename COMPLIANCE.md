# Compliance Scope — NexGenKlick Gamification

This document records COPPA, FERPA, and SOC 2 scope decisions for the NexGenKlick Gamification platform (DEMO-15).

---

## COPPA (Children's Online Privacy Protection Act)

**Applicability:** The platform serves students who may be under 13. Schools act as operators on behalf of parents (School Official exception under COPPA).

| Decision | Detail |
|---|---|
| PII collected | **Parent email only** — no student real names required (display names/aliases permitted) |
| Student data | Points, badges, achievements — no government ID, no precise geolocation, no photos |
| Consent model | School obtains verifiable parental consent before enrolling students; the platform does not collect consent directly |
| Data sharing | No student data is shared with third-party advertisers or analytics services |
| Third-party analytics | **None installed** — no Google Analytics, Mixpanel, or similar SDKs in the frontend codebase |
| Deletion | Admin can permanently delete a student record via the `/admin` dashboard (FERPA compliance button) |

---

## FERPA (Family Educational Rights and Privacy Act)

**Applicability:** The platform stores education records (achievements, grades, badge progress) for students enrolled in schools.

| Decision | Detail |
|---|---|
| Legitimate interest | Platform is used under the "school official" exception — teachers and admins have a legitimate educational interest |
| Parent access | `/parent/[studentId]` route provides read-only access to the child's records, accessible by student ID (no login required for demo; auth-gated in production) |
| Data deletion | `deleteStudent()` server action in `src/app/actions.ts` performs a cascading delete of all student records across all tables |
| Audit trail | All achievements have `created_at` timestamps; admin actions are logged via Supabase |
| Data minimisation | Only achievement title, description, category, and points are stored — no health, disciplinary, or financial records |

---

## SOC 2 Guardrails

**Applicability:** SOC 2 Type II requires evidence of security, availability, processing integrity, confidentiality, and privacy controls.

### Security
- All data is stored in Supabase (PostgreSQL) with Row Level Security (RLS) enabled on every table — see `supabase/schema.sql`
- API keys are stored in environment variables (`.env.local`), never committed to source control
- The Supabase anon key exposes read-only access in demo mode; the service role key is server-side only

### Row Level Security (RLS) Policies

RLS is enabled on all tables. Demo uses permissive anon policies; production policies (commented in `schema.sql`) enforce:

| Principal | Permitted Access |
|---|---|
| Student (authenticated) | Read and write their own rows only |
| Parent (authenticated) | Read their child's rows only (matched via `parent_email`) |
| Admin (authenticated) | Read and write all rows |
| Anon (demo mode) | Full read/write — **replace with auth policies before production** |

### Availability
- Deployed on Vercel (global CDN) backed by Supabase (managed PostgreSQL with automatic backups)
- No single points of failure in the demo architecture

### Data Retention
- Achievement records older than **365 days** (1 academic year) are purged via the `purge_old_achievements()` Postgres function defined in `schema.sql`
- Schedule via Supabase `pg_cron`: `select cron.schedule('purge-old-achievements', '0 2 * * 0', 'select purge_old_achievements()')`

### Privacy
- Parent email is the **only PII stored** — display names and avatars are pseudonymous
- No third-party analytics, advertising, or tracking SDKs are included in the frontend (`src/`) codebase
- Email notifications (DEMO-07) are sent via the `notify-parent-on-badge` Supabase Edge Function — no email content is stored on the platform

---

## Data Fields Collected & Why

| Field | Table | Purpose | PII? |
|---|---|---|---|
| `name` (display) | `students` | Identify student in UI — aliases permitted | Pseudonymous |
| `grade` | `students` | Group students by grade level | No |
| `avatar_emoji` | `students` | Profile customisation | No |
| `total_points`, `streak_count` | `students` | Gamification metrics | No |
| `parent_email` | `students` | Badge award notification emails | **Yes — only PII field** |
| `class_id` | `students` | Class grouping for leaderboard | No |
| Achievement `title`, `description`, `category` | `achievements` | Track learning accomplishments | No |
| `points_awarded`, `created_at` | `achievements` | Scoring and analytics | No |

---

## No Third-Party Analytics

The following SDKs are **not present** in this codebase:

- ✗ Google Analytics / Google Tag Manager
- ✗ Mixpanel
- ✗ Amplitude
- ✗ Segment
- ✗ Meta Pixel / Twitter Pixel
- ✗ Hotjar / FullStory

The only external runtime dependencies are `@supabase/supabase-js`, `recharts`, and `canvas-confetti` — none of which collect or transmit user data to third parties.

---

*Last updated: 2026-04-30*
