import { NextResponse } from "next/server";
import { getOpportunityScore } from "@/lib/data/services";

export async function GET() {
  return NextResponse.json(getOpportunityScore());
}
