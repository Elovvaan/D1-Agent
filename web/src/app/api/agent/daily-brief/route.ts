import { NextResponse } from "next/server";
import { getDailyBrief } from "@/lib/data/services";

export async function GET() {
  return NextResponse.json(getDailyBrief());
}
