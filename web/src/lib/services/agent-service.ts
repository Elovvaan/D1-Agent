import type { MatchResult } from "@d1/shared";

export type AgentVariant = "athlete" | "coach" | "recruiter";

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
  }) {
    const topMatch = input.matches[0];
    const topOpportunity = input.opportunities[0];

    return {
      yesterday: [
        `Your Trust Score is ${input.trust.score}. The next lift comes from coach-verified data.`,
        "Your latest film was added to the recruiting loop."
      ],
      today: [
        topOpportunity?.rationale ?? "I am watching for new verified opportunities today.",
        topMatch
          ? `I believe your next opportunity is ${topMatch.collegeId} because ${topMatch.reasons[0].toLowerCase()}.`
          : "I am ranking new colleges against your verified profile."
      ],
      upcoming: [
        input.nextGame ? `${input.nextGame} is the next film event I am preparing for.` : "Your next game will refresh film, stats, and matches.",
        "Any external outreach remains prepared for approval before it leaves D1."
      ]
    };
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
