# MyD1 Domain Configuration

Primary brand: MyD1

Primary domain: `myd1.sports`

App domain: `myd1.app`

Required Railway environment variables:

- `NEXT_PUBLIC_APP_URL=https://app.myd1.sports`
- `NEXT_PUBLIC_MARKETING_URL=https://myd1.sports`
- `NEXT_PUBLIC_PUBLIC_PROFILE_BASE_URL=https://myd1.sports`

Supported portal entry points:

- `myd1.sports` - marketing/public athlete profiles
- `app.myd1.sports` - athlete app
- `coach.myd1.sports` - Coach portal
- `recruiter.myd1.sports` - Recruiter portal
- `team.myd1.sports` - Team portal
- `media.myd1.sports` - Media/film
- `admin.myd1.sports` - Admin
- `api.myd1.sports` - API
- `myd1.app` - app short domain

Routing status:

- Active safe redirects exist for `coach.myd1.sports`, `recruiter.myd1.sports`, `media.myd1.sports`, and `admin.myd1.sports` when those hosts land on `/`.
- Team and API subdomain routing are configured as domain intent only until those production portals are connected.
- Share and public profile URLs must use `NEXT_PUBLIC_PUBLIC_PROFILE_BASE_URL`; do not hardcode localhost.
