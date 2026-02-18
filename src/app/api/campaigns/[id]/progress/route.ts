import { NextRequest, NextResponse } from "next/server";
import { fetchSheet, RANGE } from "@/lib/google-sheet";

type CampaignRow = {
  id: string;
  goal_amount: string;
  collected_amount: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaigns = await fetchSheet<CampaignRow>(
    RANGE.CAMPAIGNS
  );

  const campaign = campaigns.find(
    (c) => c.id === params.id
  );

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    total: Number(campaign.collected_amount || 0),
    target: Number(campaign.goal_amount || 1),
  });
}
