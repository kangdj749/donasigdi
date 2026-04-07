import { NextResponse } from "next/server";
import { incrementShare } from "@/lib/prayer.engine";

export async function POST(req: Request) {
  try {
    const { prayerId } = await req.json();

    if (!prayerId) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const total = incrementShare(prayerId);

    return NextResponse.json({
      success: true,
      total,
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}