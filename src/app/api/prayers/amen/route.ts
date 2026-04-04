import { NextResponse } from "next/server";
import { incrementLocalAmen } from "@/lib/campaign.amen.service";

export async function POST(req: Request) {
  try {
    const { prayerId } = await req.json();

    if (!prayerId) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const total = incrementLocalAmen(prayerId);

    return NextResponse.json({
      success: true,
      total,
    });
  } catch (err) {
    console.error("AMEN ERROR:", err);

    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}