import { NextResponse } from "next/server";
export async function GET(_: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return NextResponse.json(
    {
      gameId,
      status: "not_found",
      message: "No saved or imported game context exists for this game yet."
    },
    { status: 404 }
  );
}
