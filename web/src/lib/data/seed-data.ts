import type {
  AthleteBrandProfile,
  AthleteProfile,
  CalendarEvent,
  CoachProfile,
  CollegeMatch,
  Film,
  Game,
  Highlight,
  Membership,
  MessageThread,
  Org,
  RecruiterProfile,
  RecruitingOpportunity,
  StatLine,
  TimelineEvent,
  TrustScore,
  User
} from "@d1/shared";

export const seedUsers: User[] = [
  { id: "user-athlete-jayden", email: "jayden@d1agent.test", fullName: "Jayden Lewis", status: "active" },
  { id: "user-coach-davis", email: "coach.davis@d1agent.test", fullName: "Marcus Davis", status: "active" },
  { id: "user-recruiter-thompson", email: "coach.thompson@d1agent.test", fullName: "Erin Thompson", status: "active" },
  { id: "user-admin-rivera", email: "ops@d1agent.test", fullName: "Avery Rivera", status: "active" }
];

export const seedOrgs: Org[] = [
  { id: "org-north-ridge", type: "high_school", name: "North Ridge High", division: "High School", city: "Denver", state: "CO", verified: true },
  { id: "org-state-university", type: "college", name: "State University", division: "NCAA D1", city: "Fort Collins", state: "CO", verified: true },
  { id: "org-westfield", type: "college", name: "Westfield University", division: "NCAA D1", city: "Omaha", state: "NE", verified: true },
  { id: "org-brown", type: "college", name: "Brown College", division: "NCAA D1", city: "Providence", state: "RI", verified: true },
  { id: "org-northview", type: "college", name: "Northview University", division: "NCAA D2", city: "Boise", state: "ID", verified: true },
  { id: "org-lakeside", type: "college", name: "Lakeside College", division: "NCAA D2", city: "Madison", state: "WI", verified: true },
  { id: "org-d1-agent", type: "platform", name: "D1 Agent", verified: true }
];

export const seedMemberships: Membership[] = [
  { id: "member-athlete-jayden", userId: "user-athlete-jayden", role: "athlete", orgId: "org-north-ridge", plan: "d1_pro", status: "active" },
  { id: "member-coach-davis", userId: "user-coach-davis", role: "coach", orgId: "org-north-ridge", plan: "team", status: "active" },
  { id: "member-recruiter-thompson", userId: "user-recruiter-thompson", role: "recruiter", orgId: "org-state-university", plan: "enterprise", status: "active" },
  { id: "member-admin-rivera", userId: "user-admin-rivera", role: "admin", orgId: "org-d1-agent", plan: "enterprise", status: "active" }
];

export const seedAthletes: AthleteProfile[] = [
  {
    id: "athlete-jayden-lewis",
    userId: "user-athlete-jayden",
    fullName: "Jayden Lewis",
    classYear: 2026,
    sport: "Football",
    primaryPosition: "QB",
    secondaryPosition: "WR",
    jerseyNumber: "7",
    schoolName: "North Ridge High",
    hometown: "Denver, CO",
    bio: "Dual-threat quarterback with verified varsity film, strong academics, and growing recruiter engagement after a fresh mid-season reel.",
    visibility: "recruiters_only",
    isMinor: true,
    parentConsentSigned: true,
    completionPct: 76,
    varsityStarter: true,
    progressionLevel: "B1",
    progressionLabel: "B1 Recruit",
    progressionStage: "Verified recruiting profile",
    progressionDescription: "Your recruiting journey is active. Your next move is coach verification and updated film.",
    progressionPercent: 58,
    nextProgressionLevel: "C1",
    progressionMilestones: [
      { label: "complete recruiting profile", complete: true, source: "demo" },
      { label: "upload highlight reel", complete: true, source: "demo" },
      { label: "verify stats", complete: false, source: "demo" },
      { label: "connect coach", complete: true, source: "demo" },
      { label: "create college target list", complete: true, source: "demo" },
      { label: "send first outreach", complete: false, source: "demo" }
    ],
    progressionHistory: [
      { level: "B1", label: "B1 Recruit", occurredAt: "2026-06-01", note: "Demo athlete entered active recruiting path." }
    ]
  }
];

export const seedCoachProfiles: CoachProfile[] = [
  {
    id: "coach-profile-davis",
    userId: "user-coach-davis",
    orgId: "org-north-ridge",
    title: "Head Coach",
    verified: true,
    verificationQueueCount: 3
  }
];

export const seedRecruiterProfiles: RecruiterProfile[] = [
  {
    id: "recruiter-profile-thompson",
    userId: "user-recruiter-thompson",
    orgId: "org-state-university",
    territory: ["CO", "NE", "KS", "UT"],
    positionGroups: ["QB", "WR", "ATH"],
    verified: true
  }
];

export const seedGames: Game[] = [
  { id: "game-central", athleteId: "athlete-jayden-lewis", opponent: "Central High School", gameDate: "2026-05-24T19:00:00-06:00", location: "North Ridge Stadium", source: "stream", status: "scheduled", highlightCount: 0 },
  { id: "game-east-valley", athleteId: "athlete-jayden-lewis", opponent: "East Valley", gameDate: "2026-05-17T19:00:00-06:00", location: "East Valley High", source: "upload", status: "ready", highlightCount: 9 },
  { id: "game-pine-creek", athleteId: "athlete-jayden-lewis", opponent: "Pine Creek", gameDate: "2026-05-10T19:00:00-06:00", location: "Pine Creek", source: "stream", status: "processing", highlightCount: 3 },
  { id: "game-westview", athleteId: "athlete-jayden-lewis", opponent: "Westview High", gameDate: "2026-05-03T19:00:00-06:00", location: "North Ridge Stadium", source: "external", status: "ready", highlightCount: 6 }
];

export const seedFilms: Film[] = [
  { id: "film-east-valley-full", athleteId: "athlete-jayden-lewis", gameId: "game-east-valley", title: "East Valley full game", type: "full_game", durationSeconds: 6420, processingState: "ready", viewCount: 38 },
  { id: "film-pine-creek-stream", athleteId: "athlete-jayden-lewis", gameId: "game-pine-creek", title: "Pine Creek livestream recording", type: "full_game", durationSeconds: 6180, processingState: "processing", viewCount: 12 },
  { id: "film-westview-context", athleteId: "athlete-jayden-lewis", gameId: "game-westview", title: "Westview verified context film", type: "clip", durationSeconds: 940, processingState: "ready", viewCount: 21 }
];

export const seedHighlights: Highlight[] = [
  { id: "highlight-1", athleteId: "athlete-jayden-lewis", gameId: "game-east-valley", title: "Touchdown over middle", playType: "Passing TD", score: 94, verified: true, published: true },
  { id: "highlight-2", athleteId: "athlete-jayden-lewis", gameId: "game-east-valley", title: "Kick return crease", playType: "Special teams", score: 90, verified: true, published: true },
  { id: "highlight-3", athleteId: "athlete-jayden-lewis", gameId: "game-east-valley", title: "Third-down sideline catch", playType: "Conversion", score: 86, verified: true, published: true },
  { id: "highlight-4", athleteId: "athlete-jayden-lewis", gameId: "game-westview", title: "Red-zone fade", playType: "Passing TD", score: 82, verified: true, published: false },
  { id: "highlight-5", athleteId: "athlete-jayden-lewis", gameId: "game-westview", title: "Open-field block", playType: "Run support", score: 78, verified: false, published: false },
  { id: "highlight-6", athleteId: "athlete-jayden-lewis", gameId: "game-pine-creek", title: "Deep post separation", playType: "Explosive play", score: 74, verified: false, published: false }
];

export const seedStats: StatLine[] = [
  { id: "stat-height", athleteId: "athlete-jayden-lewis", metric: "Height / Weight", value: 1, displayValue: "6'1, 184 lb", source: "coach_verified", verified: true },
  { id: "stat-forty", athleteId: "athlete-jayden-lewis", metric: "Forty Yard", value: 4.48, displayValue: "4.48", source: "coach_verified", verified: true },
  { id: "stat-gpa", athleteId: "athlete-jayden-lewis", metric: "GPA", value: 3.72, displayValue: "3.72", source: "multi_source", verified: false },
  { id: "stat-passing", athleteId: "athlete-jayden-lewis", gameId: "game-east-valley", metric: "Passing Yards", value: 248, displayValue: "248 yds", source: "ai_extracted", verified: true }
];

export const seedTrustScores: TrustScore[] = [
  {
    athleteId: "athlete-jayden-lewis",
    score: 82,
    tier: "good",
    factors: [
      { label: "Coach Verified", factor: "coach_verified", status: "partial", weight: 0.65, displayWeight: "65%", detail: "Coach Davis verified East Valley game stats." },
      { label: "AI Verified", factor: "stats_matched", status: "met", weight: 0.15, displayWeight: "15%", detail: "AI extracted stats match public box score." },
      { label: "Public Records", factor: "public_record_matched", status: "met", weight: 0.1, displayWeight: "10%", detail: "Roster and jersey number matched." },
      { label: "Self Reported", factor: "film_uploaded", status: "met", weight: 0.1, displayWeight: "10%", detail: "Latest game film is fresh and attached." }
    ]
  }
];

export const seedOpportunities: RecruitingOpportunity[] = [
  {
    id: "opp-state-u",
    athleteId: "athlete-jayden-lewis",
    type: "new_match",
    payload: { college: "State University" },
    rationale: "I found a high-fit program with an open 2026 quarterback need. Your latest reel gives us a credible reason to start outreach.",
    actionType: "draft_outreach",
    relevance: 0.96,
    state: "new"
  },
  {
    id: "opp-coach-open",
    athleteId: "athlete-jayden-lewis",
    type: "coach_open",
    payload: { coach: "Coach Marcus Davis" },
    rationale: "Coach Davis opened the verification request. That is the fastest path to moving your Trust Score this week.",
    actionType: "request_verification",
    relevance: 0.89,
    state: "new"
  },
  {
    id: "opp-reel-views",
    athleteId: "athlete-jayden-lewis",
    type: "reel_views_up",
    payload: { reelViews: 38 },
    rationale: "Your reel views climbed after the new clips were added. I recommend refreshing the opening sequence while attention is active.",
    actionType: "generate_reel",
    relevance: 0.78,
    state: "seen"
  }
];

export const seedMatches: CollegeMatch[] = [
  { id: "match-state-u", athleteId: "athlete-jayden-lewis", collegeId: "org-state-university", collegeName: "State University", division: "NCAA D1", distanceMiles: 250, matchPct: 95, interestLevel: "high", stage: "contacted", reasons: ["QB need in 2026 class", "GPA clears academic profile", "Recent reel views from staff"], logoText: "S" },
  { id: "match-westfield", athleteId: "athlete-jayden-lewis", collegeId: "org-westfield", collegeName: "Westfield University", division: "NCAA D1", distanceMiles: 180, matchPct: 89, interestLevel: "high", stage: "prospect", reasons: ["Regional fit", "Special teams athletic profile", "Coach recommendation pending"], logoText: "W" },
  { id: "match-brown", athleteId: "athlete-jayden-lewis", collegeId: "org-brown", collegeName: "Brown College", division: "NCAA D1", distanceMiles: 320, matchPct: 85, interestLevel: "medium", stage: "evaluating", reasons: ["Academic fit", "Verified film freshness", "Recruiter watchlist activity"], logoText: "B" },
  { id: "match-northview", athleteId: "athlete-jayden-lewis", collegeId: "org-northview", collegeName: "Northview University", division: "NCAA D2", distanceMiles: 210, matchPct: 78, interestLevel: "medium", stage: "responded", reasons: ["Division fit is realistic", "Quarterback depth need", "Strong trust score"], logoText: "N" },
  { id: "match-lakeside", athleteId: "athlete-jayden-lewis", collegeId: "org-lakeside", collegeName: "Lakeside College", division: "NCAA D2", distanceMiles: 150, matchPct: 72, interestLevel: "medium", stage: "prospect", reasons: ["Roster fit", "Coach viewed film", "Nearby official visit window"], logoText: "LC" }
];

export const seedTimelineEvents: TimelineEvent[] = [
  { id: "timeline-film", athleteId: "athlete-jayden-lewis", title: "New film uploaded: vs Westview High", detail: "AI is processing your game film", eventType: "game_uploaded", state: "active", meta: "2h ago" },
  { id: "timeline-highlights", athleteId: "athlete-jayden-lewis", title: "9 new highlights were created", detail: "Review and add to your reel", eventType: "highlights_generated", state: "done", meta: "3h ago" },
  { id: "timeline-trust", athleteId: "athlete-jayden-lewis", title: "Coach Davis verified your stats", detail: "Trust Score increased to 82", eventType: "coach_verified", state: "done", meta: "5h ago" },
  { id: "timeline-message", athleteId: "athlete-jayden-lewis", title: "New message from Coach Thompson", detail: "Check your messages", eventType: "recruiter_responded", state: "active", meta: "7h ago" },
  { id: "timeline-watchlist", athleteId: "athlete-jayden-lewis", title: "3 colleges added you to their watch list", detail: "View your college matches", eventType: "match_updated", state: "done", meta: "Yesterday" }
];

export const seedCalendarEvents: CalendarEvent[] = [
  { id: "event-central", athleteId: "athlete-jayden-lewis", month: "MAY", day: "24", title: "vs Central High School", detail: "Varsity Game - 7:00 PM", kind: "live_stream", startsAt: "2026-05-24T19:00:00-06:00" },
  { id: "event-elite11", athleteId: "athlete-jayden-lewis", month: "MAY", day: "31", title: "Elite 11 Regional", detail: "Camp - All Day", kind: "camp", startsAt: "2026-05-31T09:00:00-06:00" },
  { id: "event-showcase", athleteId: "athlete-jayden-lewis", month: "JUN", day: "08", title: "College Showcase", detail: "Combine - 9:00 AM", kind: "event", startsAt: "2026-06-08T09:00:00-06:00" },
  { id: "event-visit", athleteId: "athlete-jayden-lewis", month: "JUN", day: "15", title: "Official Visit", detail: "State University - All Day", kind: "visit", startsAt: "2026-06-15T10:00:00-06:00" }
];

export const seedMessages: MessageThread[] = [
  { id: "thread-davis", participantName: "Coach Marcus Davis", participantRole: "coach", subject: "East Valley verification", latestMessage: "I verified the East Valley stats. Great tape.", unreadCount: 1, lastMessageAt: "12m" },
  { id: "thread-state-u", participantName: "State University", participantRole: "recruiter", subject: "Full game request", latestMessage: "Can you send the full game from Friday?", unreadCount: 3, lastMessageAt: "1h" },
  { id: "thread-ops", participantName: "D1 Ops", participantRole: "ops", subject: "Transcript review", latestMessage: "Transcript upload received and queued for review.", unreadCount: 1, lastMessageAt: "3h" }
];

export const seedBrandProfiles: AthleteBrandProfile[] = [
  {
    athleteId: "athlete-jayden-lewis",
    handles: {
      instagram: "@jaydenlewisqb",
      tiktok: "@jayden.qb7",
      youtube: "youtube.com/@jaydenlewisqb",
      hudl: "hudl.com/profile/jayden-lewis",
      x: "",
      website: "jaydenlewisfootball.com"
    },
    latestPosts: [
      { id: "post-ig-1", platform: "instagram", title: "East Valley reel cut", postedAt: "2026-06-25", url: "https://instagram.com/jaydenlewisqb", impressions: 12400, engagements: 918, engagementRate: 7.4 },
      { id: "post-tt-1", platform: "tiktok", title: "QB footwork session", postedAt: "2026-06-24", url: "https://tiktok.com/@jayden.qb7", impressions: 18600, engagements: 1310, engagementRate: 7.0 },
      { id: "post-hudl-1", platform: "hudl", title: "2026 mid-season highlights", postedAt: "2026-06-23", url: "https://hudl.com/profile/jayden-lewis", impressions: 2100, engagements: 184, engagementRate: 8.8 }
    ],
    metrics: {
      followers: 8420,
      weeklyReach: 33100,
      engagementRate: 7.6,
      profileClicks: 312
    },
    agentRecommendations: [
      "Pin the verified East Valley reel across Instagram, TikTok, YouTube, and Hudl for a consistent recruiter first impression.",
      "Post one academic/training update before the Elite 11 Regional so coaches see the full profile, not only game clips.",
      "Add the D1 public profile link to every platform bio to route interest back into measurable recruiter activity."
    ]
  }
];
