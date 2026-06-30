# V1 Access Flow

## Public Routes

- `/`
- `/search`
- `/about`
- `/schools`
- `/sports`
- `/get-started`
- `/sign-in`
- `/privacy`
- `/terms`
- `/support`
- `/contact`
- `/athletes/[athleteId]` only when the saved athlete profile visibility is `public`

## Protected Routes

- `/command-center`
- `/profile`
- `/performance`
- `/trust`
- `/recruiting`
- `/opportunities`
- `/messages`
- `/calendar`
- `/coach`
- `/recruiter`
- `/media`
- `/admin`
- `/settings`
- `/film`
- `/highlights`
- `/outreach`
- `/onboarding`

Unauthenticated visitors to protected routes redirect to `/sign-in?next=ORIGINAL_PATH`.

The root route `/` never redirects automatically. If a valid local session exists, the landing page stays visible and shows a `Continue to Dashboard` button that links to the correct role dashboard.

## Manual Checklist

1. Open a private/incognito browser.
2. Visit `/`; expected: public MyD1 landing page.
3. Visit `/command-center`; expected: redirect to `/sign-in?next=/command-center`.
4. Visit `/profile`; expected: redirect to `/sign-in?next=/profile`.
5. Visit `/coach`; expected: redirect to `/sign-in?next=/coach`.
6. Visit `/media`; expected: redirect to `/sign-in?next=/media`.
7. Visit `/admin`; expected: redirect to `/sign-in?next=/admin`.
8. Visit `/athletes/athlete-jayden-lewis` with no saved public profile; expected: redirect to sign-in.
9. Save an athlete profile with `visibility: "public"`; revisit `/athletes/athlete-jayden-lewis`; expected: public profile page.
10. From `/get-started`, choose Athlete; expected: `/sign-in?role=athlete&next=/onboarding/athlete`.
11. Click Continue on sign-in; expected: protected onboarding opens with local dev role session.
12. Revisit `/` while signed in; expected: landing page remains visible with `Continue to Dashboard`, not an automatic dashboard redirect.

## Real User Data Rule

Real User Mode does not automatically fall back to Jayden/Jaylen demo athlete data. If no saved athlete profile exists, authenticated athlete pages show starter/empty profile state until the user saves their own profile.
