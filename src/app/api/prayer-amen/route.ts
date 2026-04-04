import { NextResponse } from "next/server";
import { incrementPrayerAmen } from "@/lib/campaign.amen.service";

export async function POST(req: Request) {
  const { prayerId } = await req.json();

  if (!prayerId) {
    return NextResponse.json(
      { error: "Invalid prayerId" },
      { status: 400 }
    );
  }

  const total = await incrementPrayerAmen(prayerId);

  return NextResponse.json({ total });
}
