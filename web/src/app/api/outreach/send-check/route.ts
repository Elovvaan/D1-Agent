import { NextResponse } from "next/server";
import { agentService } from "@/lib/services/agent-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { isMinor?: boolean; parentConsentSigned?: boolean; approved?: boolean };
  return NextResponse.json(
    agentService.assertSendAllowed({
      isMinor: Boolean(body.isMinor),
      parentConsentSigned: Boolean(body.parentConsentSigned),
      approved: Boolean(body.approved)
    })
  );
}

