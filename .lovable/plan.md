- Freelance Booking & Management Portal

Building on TanStack Start + TypeScript (Lovable's stack — same capabilities as Next.js: SSR, server functions, DB, auth, realtime). Lovable Cloud will be enabled for database, auth, storage, and realtime.

## Scope (v1)

- Email/password + Google sign-in
- Two user roles: **client** and **freelancer** (chosen at signup, stored in a separate `user_roles` table)
- Freelancer profiles (bio, skills, hourly rate, avatar)
- Browse & search freelancers
- Booking requests with status flow: `pending → accepted / declined → completed / cancelled`
- Realtime 1:1 messaging tied to a booking
- Two-way reviews (1–5 stars + comment) unlocked only after a booking is `completed`

## Pages / Routes

```text
/                       Landing (hero, browse CTA)
/auth                   Sign in / sign up (email + Google)
/browse                 Public freelancer directory + search
/freelancer/$id         Public freelancer profile (bio, reviews, "Book" CTA)
/_authenticated/dashboard         Role-aware dashboard (my bookings)
/_authenticated/profile           Edit own profile / freelancer listing
/_authenticated/bookings/$id      Booking detail + messaging thread + review form (when completed)
/_authenticated/messages          Inbox of all conversations
```

## Data model (Lovable Cloud / Postgres)

- `profiles` — id (FK auth.users), full_name, avatar_url, bio, headline, hourly_rate, skills[]
- `user_roles` — user_id, role (`client` | `freelancer` | `admin`) — separate table per security best practice, checked via `has_role()` security-definer fn
- `bookings` — id, client_id, freelancer_id, title, description, scheduled_for, status, price, created_at
- `messages` — id, booking_id, sender_id, body, created_at (realtime enabled)
- `reviews` — id, booking_id, reviewer_id, reviewee_id, rating (1–5), comment, created_at; unique(booking_id, reviewer_id)

RLS on all tables. Reviews insert policy checks the referenced booking is `completed` and the reviewer participated.

## Messaging (realtime)

- Thread per booking, accessible to the two participants
- Supabase realtime subscription on `messages` filtered by `booking_id`
- Optimistic send, auto-scroll, unread indicator in inbox

## Reviews flow

- Once booking status flips to `completed`, both parties see a "Leave review" panel on the booking page
- Submitting inserts into `reviews`; blocked by RLS + unique constraint if already reviewed
- Freelancer profile shows average rating + individual reviews

## Out of scope for v1 (can add later)

- Payments (Stripe/Paddle)
- Admin dashboard
- File attachments in messages
- Push/email notifications
- Disputes / cancellation refunds

## Technical notes

- TanStack Start file-based routes; protected routes under `src/routes/_authenticated/`
- Server functions (`createServerFn` + `requireSupabaseAuth`) for all writes
- Public reads (browse, public profile) via server publishable client with narrow `TO anon` SELECT policies
- Google OAuth via Lovable broker (`lovable.auth.signInWithOAuth`)
- Design: clean, professional marketplace aesthetic — I'll pick a distinctive palette/type rather than default AI look

## Build order

1. Enable Lovable Cloud, create schema + RLS + roles
2. Auth pages, role selection, protected layout
3. Profile edit + freelancer directory + public profile
4. Bookings (request, accept/decline, complete)
5. Realtime messaging on booking page + inbox
6. Reviews after completion + rating display on profile
7. Polish landing page + SEO metadata per route