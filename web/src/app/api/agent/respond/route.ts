import { NextResponse } from "next/server";
import { getAgentResponse } from "@/lib/data/services";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "Ask the Agent a question." }, { status: 400 });
  }

  const currentPage = typeof body.currentPage === "string" ? body.currentPage : undefined;
  const athleteId = typeof body.athleteId === "string" ? body.athleteId : undefined;
  const response = getAgentResponse({ question, currentPage, athleteId });

  return NextResponse.json({
    answer: response.answer,
    recommendedActions: response.recommendedActions
  });
}
