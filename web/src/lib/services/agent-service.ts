import type { AgentCapability, AgentIntentContext, AgentIntentSignal, MatchResult } from "@d1/shared";

export type AgentVariant = "athlete" | "coach" | "recruiter";

type CapabilityScore = {
  capability: AgentCapability;
  score: number;
  reasons: string[];
};

export class AgentService {
  greeting(variant: AgentVariant, name: string) {
    if (variant === "coach") return `Good Morning, Coach ${name}.`;
    if (variant === "recruiter") return `Good Morning. I updated your recruiting board.`;
    return `Good Morning, ${name}. I'm your Agent. My job is to maximize your opportunities.`;
  }

  dailyBrief(input: {
    trust: { score: number };
    matches: MatchResult[];
    opportunities: Array<{ rationale: string }>;
    nextGame?: string;
    intentContext: AgentIntentContext;
  }) {
    const topMatch = input.matches[0];
    const topOpportunity = input.opportunities[0];
    const intent = this.inferIntent(input.intentContext);
    const primaryGuidance = this.recommendNextAction(intent, input.intentContext, topMatch, topOpportunity);

    return {
      yesterday: [
        `Your Trust Score is ${input.trust.score}. ${this.trustGuidance(input.intentContext)}`,
        this.recentActivitySummary(input.intentContext)
      ],
      today: [
        primaryGuidance,
        topOpportunity?.rationale ?? this.defaultOpportunityGuidance(input.intentContext)
      ],
      upcoming: [
        input.nextGame ? `${input.nextGame} is the next film event I am preparing for.` : this.progressionGuidance(input.intentContext),
        this.safetyGuidance(intent)
      ]
    };
  }

  inferIntent(context: AgentIntentContext): AgentIntentSignal {
    const scores: CapabilityScore[] = [
      { capability: "scouting", score: 0, reasons: [] },
      { capability: "recruiting", score: 0, reasons: [] },
      { capability: "brand", score: 0, reasons: [] },
      { capability: "marketing", score: 0, reasons: [] },
      { capability: "career_development", score: 0, reasons: [] }
    ];
    const add = (capability: AgentCapability, score: number, reason: string) => {
      const target = scores.find((item) => item.capability === capability);
      if (!target) return;
      target.score += score;
      target.reasons.push(reason);
    };
    const query = `${context.userQuestion ?? ""} ${context.currentPage ?? ""}`.toLowerCase();

    if (/film|clip|highlight|stat|roster|scout|game|performance|combine/.test(query)) add("scouting", 4, "Question or page is about film, stats, games, or evaluation.");
    if (/recruit|college|coach|outreach|offer|match|visit|school/.test(query)) add("recruiting", 4, "Question or page is about recruiting movement.");
    if (/brand|instagram|tiktok|youtube|hudl|social|website/.test(query)) add("brand", 4, "Question or page is about athlete brand signals.");
    if (/share|profile|views|audience|campaign|market|public/.test(query)) add("marketing", 3, "Question or page is about public profile distribution.");
    if (/career|progression|a1|b1|c1|d1|nil|pro|transfer|development/.test(query)) add("career_development", 4, "Question or page is about long-term athlete path.");

    if (context.uploadedMediaCount > 0 || context.publicStatsCount > 0) add("scouting", 2, "Verified media or public stats are available for evaluation.");
    if (context.opportunityCount > 0 || context.recruitingStatus !== "prospect") add("recruiting", 3, "Recruiting pipeline or opportunities are active.");
    if (context.brandCompleteness < 70) add("brand", 2, "Brand links or social proof are incomplete.");
    if (context.profileCompleteness >= 70 && context.opportunityCount > 0) add("marketing", 2, "Profile has enough context to distribute to more viewers.");
    if (context.profileCompleteness < 80) add("career_development", 2, "Profile completion is still a foundational career step.");

    if (context.progressionLevel === "A1") add("career_development", 3, "A1 athletes need foundation and development guidance first.");
    if (context.progressionLevel === "B1") add("recruiting", 3, "B1 athletes are in an active recruiting stage.");
    if (context.progressionLevel === "C1") add("career_development", 3, "C1 athletes need college profile and transfer-ready materials maintained.");
    if (context.progressionLevel === "D1") {
      add("marketing", 2, "D1 athletes need elite public profile positioning.");
      add("brand", 2, "D1 athletes need brand and sponsorship readiness.");
    }

    const best = scores.sort((a, b) => b.score - a.score)[0];
    const total = Math.max(1, scores.reduce((sum, item) => sum + Math.max(0, item.score), 0));
    return {
      capability: best.capability,
      confidence: Math.min(0.99, Math.max(0.35, best.score / total)),
      reasons: best.reasons
    };
  }

  respond(input: { question: string; context: AgentIntentContext }) {
    const intent = this.inferIntent({ ...input.context, userQuestion: input.question });
    return {
      answer: this.recommendNextAction(intent, input.context),
      recommendedActions: this.actionRecommendations(intent, input.context),
      internalIntent: intent
    };
  }

  private recommendNextAction(intent: AgentIntentSignal, context: AgentIntentContext, topMatch?: MatchResult, topOpportunity?: { rationale: string }) {
    if (intent.capability === "scouting") {
      if (context.publicStatsCount > 0) return "I am comparing your public stats with your film and keeping low-confidence matches in review before they affect your profile.";
      if (context.uploadedMediaCount > 0) return "Your next move is turning recent film into verified clips that coaches can evaluate quickly.";
      return "Upload recent game film so I can evaluate performance, identify highlight candidates, and prepare scouting context.";
    }
    if (intent.capability === "recruiting") {
      if (topMatch) return `Your next recruiting move is ${topMatch.collegeId}; the fit is strongest because ${topMatch.reasons[0].toLowerCase()}.`;
      return topOpportunity?.rationale ?? "I am ranking colleges against your verified profile and waiting for stronger match signals before recommending outreach.";
    }
    if (intent.capability === "brand") {
      if (context.brandCompleteness < 70) return "Connect the brand links coaches actually use first: Hudl, YouTube, and your recruiting website.";
      return "Your brand foundation is usable; keep public links current and route attention back to your MyD1 profile.";
    }
    if (intent.capability === "marketing") {
      if (context.profileCompleteness < 80) return "Before pushing your profile wider, finish the missing profile fields so public traffic lands on a complete story.";
      return "Your public profile is ready for controlled sharing; I will keep contact routed through D1 inbox and guardian approval when required.";
    }

    return this.progressionGuidance(context);
  }

  private actionRecommendations(intent: AgentIntentSignal, context: AgentIntentContext) {
    const actions: Record<AgentCapability, string[]> = {
      scouting: ["Upload or select the newest film.", "Review public stats before they become trusted signals.", "Request coach verification for key performance data."],
      recruiting: ["Review the highest-fit college match.", "Prepare outreach for approval.", "Update film before sending to coaches."],
      brand: ["Connect Hudl and YouTube.", "Add the MyD1 public profile link to social bios.", "Review latest posts for recruiting relevance."],
      marketing: ["Copy the public profile link.", "Preview as recruiter.", "Share only visibility-safe profile sections."],
      career_development: ["Complete the next progression milestone.", "Keep documents and verified stats current.", "Align today’s work with the next progression level."]
    };
    const selected = actions[intent.capability];
    if (context.profileCompleteness < 60) return ["Complete the athlete profile.", ...selected.slice(0, 2)];
    return selected;
  }

  private trustGuidance(context: AgentIntentContext) {
    if (context.trustScore < 70) return "The next lift comes from verified film, public records, and coach-reviewed data.";
    if (context.publicStatsCount > 0) return "Public stats are helping, but only high-confidence matches should influence profile trust.";
    return "The next lift comes from coach-verified data.";
  }

  private recentActivitySummary(context: AgentIntentContext) {
    return context.recentActivity[0] ?? "I am watching your profile, media, recruiting, and public data signals for the next useful move.";
  }

  private defaultOpportunityGuidance(context: AgentIntentContext) {
    if (context.profileCompleteness < 80) return "I am prioritizing profile completeness before recommending broader outreach.";
    if (context.uploadedMediaCount === 0) return "I am waiting for recent film so opportunity recommendations are grounded in performance.";
    return "I am watching for new verified opportunities today.";
  }

  private progressionGuidance(context: AgentIntentContext) {
    if (context.progressionLevel === "A1") return "Build your foundation with consistent training, first film, and early coach feedback.";
    if (context.progressionLevel === "B1") return "Your recruiting journey is active; coach verification and updated film are the next leverage points.";
    if (context.progressionLevel === "C1") return "Keep college performance, awards, eligibility, and transfer-ready materials current.";
    return "Keep your elite profile, brand, performance history, and opportunities organized.";
  }

  private safetyGuidance(intent: AgentIntentSignal) {
    if (intent.capability === "marketing" || intent.capability === "recruiting") {
      return "Any external contact remains routed through D1 approval and safety gates before it leaves the platform.";
    }
    return "I will keep recommendations tied to verified context and review gates.";
  }

  assertSendAllowed(input: { isMinor: boolean; parentConsentSigned: boolean; approved: boolean }) {
    if (!input.approved) {
      return { allowed: false, reason: "External sends require athlete approval." };
    }

    if (input.isMinor && !input.parentConsentSigned) {
      return { allowed: false, reason: "Minor outreach requires parent consent on file." };
    }

    return { allowed: true, reason: "Approved send may proceed." };
  }
}

export const agentService = new AgentService();
