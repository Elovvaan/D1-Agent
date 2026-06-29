# Interaction Audit

## Profile: Athlete Brand Links

- Status: Working
- Location: `/profile`
- Control: `Save Brand Links`
- Data persisted to: `data/user-state/brand-links.json`
- Feedback: Success and failure banners render at the top of the Profile page after save.
- Public surface: Saved links appear on `/athletes/athlete-jayden-lewis`.

Behavior:
- Athlete can enter, edit, clear, and save Instagram, TikTok, YouTube, Hudl, X, and personal recruiting website links.
- Empty fields are saved as empty values and shown as `Not connected`.
- `Connected` is shown only when a saved or demo value exists.
- No social link is generated from athlete name, email, or other profile fields.
- Demo Mode uses Jayden seed links when no real user brand-link state file exists.
- Real User Mode starts when `brand-links.json` exists and shows only athlete-entered links.

## Public Athlete Profile: `/athletes/[athleteId]`

- Status: Working
- Routes audited: `/athletes/athlete-jayden-lewis`, `/athletes/[unknownId]`
- Data persisted to: `data/user-state/profile.json` and `data/public-profile-actions/*.json`
- Remaining gated behavior: direct athlete phone/email remains intentionally unavailable; contact requests route through D1 inbox and guardian approval when required.

Interactions:

- Action: Watch Highlight Reel
- Expected result: Opens the athlete hero video or highlight thumbnail in a new tab. If no media exists, returns to the same public profile with a visible no-media message.
- Fixed status: Working.

- Action: Contact / Express Interest
- Expected result: Creates a D1-routed recruiter interest request artifact, never exposes private contact info, and returns with a visible confirmation.
- Fixed status: Working.

- Action: Share Profile
- Expected result: Opens the native share sheet when supported. If native share is unavailable or not completed, falls back to copying the public URL and shows feedback.
- Fixed status: Working.

- Action: Copy Link
- Expected result: Copies the absolute public profile URL when the clipboard API is available. If copying fails, displays the URL visibly instead of failing silently.
- Fixed status: Working.

- Action: Public Visibility controls
- Expected result: Public, Recruiters Only, and Private update `profile.json`, revalidate the public profile, and show a confirmation. Controls remain available even after Private is selected.
- Fixed status: Working.

- Action: Search athlete public profiles
- Expected result: Searches available athlete records by name, school, sport, position, and class year. Empty results show `No athlete found.`
- Fixed status: Working.

- Action: Search result click
- Expected result: Navigates to the selected athlete's working public profile route.
- Fixed status: Working.

- Action: Athlete Brand links
- Expected result: Connected platforms open the athlete-entered URL in a new tab. Empty platforms show `Not connected` and do not render dead links.
- Fixed status: Working.

- Action: Hero video background
- Expected result: Renders one muted, autoplaying, looping, playsInline video when a hero/highlight video exists. Falls back to the latest thumbnail, then the D1 branded fallback state.
- Fixed status: Working.

- Action: Unknown athlete public route
- Expected result: Shows a clear public profile setup state instead of a 404.
- Fixed status: Working.
