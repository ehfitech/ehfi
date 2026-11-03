# Supabase setup — EHFI

This application uses Supabase Auth, Postgres/RLS, and a private Storage bucket. The server-side clients use the publishable key with the signed-in user's cookie session. The secret key is limited to server routes that create, update, and clean drafts/files; never put it in a `NEXT_PUBLIC_` variable or expose it in logs.

## 1. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from the Supabase project. Do not paste keys into source files or commit `.env.local`.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Project secret key (`sb_secret_…`); server only |
| `NEXT_PUBLIC_SITE_URL` | Canonical application origin, without a trailing slash |
| `CRON_SECRET` | Random secret used to authorize draft cleanup calls |

Use the same variables in the deployment provider's server/runtime configuration. `NEXT_PUBLIC_` values are public by design. The secret key bypasses RLS and gives elevated access, so scope its use to the server-only module and draft/file repository.

## 2. Apply the database migration

Apply `supabase/migrations/202611030001_ehfi_auth_profiles.sql` and then `supabase/migrations/202611030002_ehfi_activity_platform.sql` to the intended Supabase project using the SQL Editor or the Supabase CLI connected to that project. Review the SQL editor output and confirm the tables, RLS policies, registration functions, activity/booking functions, and `professional-documents` bucket exist.

The migration creates the bucket as private, permits PDF uploads up to 10 MiB, enables RLS on all application tables, and limits direct authenticated table access to reads allowed by ownership/membership policies. Finalization functions bind requests to the authenticated user and a server-created, unexpired draft token hash. Do not replace those functions with client-side direct inserts.

The activity migration adds an explicitly editable public professional profile, dated activities, and booking history. Professionals can read their own activities and manage only their public profile. Students can read only their own booking rows. Activity creation, cancellation, discovery, and participant projections use scoped functions that check `auth.uid()` and the required role. The participant function returns only a first name and surname initial; it does not grant access to student contact, private registration, or health data. Reservation capacity and overlapping schedules are checked transactionally in Postgres. Applying these source migrations is an operator action; this application does not apply them automatically.

The activity experience uses the existing Supabase URL and publishable key. It does not require a payment provider or another environment variable. Prices are informational in this release and reservations do not collect payment.

## 3. Configure Auth

In the Supabase Dashboard:

1. In **Authentication → Sign In / Providers → Email**, turn off email confirmations for this first release. Signup relies on Supabase returning a session immediately. If the project still requires confirmation, the application deliberately does not claim the user is signed in.
2. Set the Auth **Site URL** to the deployed canonical origin.
3. Add redirect URLs for local development and production, including the callback route used by recovery: `http://localhost:3000/auth/callback` and `https://YOUR_DOMAIN/auth/callback`. Add preview origins only if they are controlled by the team.
4. Configure a production SMTP provider and sender before relying on password recovery. Password reset messages are still sent by email even though signup confirmation is disabled.
5. Review Auth rate limits and abuse protections before publishing the signup endpoints.

Set `NEXT_PUBLIC_SITE_URL` to the same canonical origin. The password recovery action uses it to build the callback URL and ignores the browser-supplied host.

## 4. Deploy and clean expired drafts

Deploy the Next.js application with the environment variables above. Schedule an authenticated `POST` once per day to:

```text
https://YOUR_DOMAIN/api/cron/registration-drafts
Authorization: Bearer YOUR_CRON_SECRET
```

Use the hosting provider's scheduled HTTP/cron feature or another trusted scheduler. Store `CRON_SECRET` in that scheduler's secret store. The endpoint removes drafts after 30 days without activity and deletes their temporary files; it preserves professional documents already referenced by a completed profile. Monitor non-2xx responses so draft/file cleanup does not silently stop.

## 5. Before accepting real users

- Add the EHFI controller's legal identity and a working privacy contact to the privacy notice.
- Obtain legal review and approve the processing purposes/bases and consent wording for each data category, especially health data.
- Decide and publish retention periods for completed accounts, health records, company intakes, and professional documents. The 30-day period applies only to unfinished drafts.
- Record the Supabase project region, SMTP provider, and applicable data transfers in the privacy materials.
- Review the decision to accept accounts for minors without a guardian workflow or authorization verification. The current application asks no guardian details and records required health-data consent as accepted by the account holder; this needs specific legal review before real use.
- Confirm the deployed domain, password-reset email delivery, and cleanup scheduler in the actual environment.

The code and migration do not apply themselves to the Supabase Dashboard. No Supabase project URL or key was provided to this workspace, so remote project configuration remains an operator step.

## Official references

- [Supabase SSR setup for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework&router=app)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
