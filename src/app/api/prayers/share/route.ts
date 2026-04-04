import { NextResponse } from "next/server";
import { incrementPrayerShare } from "@/lib/campaign.share.service";

export async function POST(req: Request) {
  try {
    const { prayerId } = await req.json();

    if (!prayerId) {
      return NextResponse.json(
        { error: "Invalid" },
        { status: 400 }
      );
    }

    const total = incrementPrayerShare(prayerId);

    return NextResponse.json({
      success: true,
      total,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}