import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  updateDonationStatus,
  incrementCampaignCollected,
} from "@/lib/google-sheet";

export async function POST(req: Request) {
  const body = await req.json();

  const signature = crypto
    .createHash("sha512")
    .update(
      body.order_id +
        body.status_code +
        body.gross_amount +
        process.env.MIDTRANS_SERVER_KEY
    )
    .digest("hex");

  if (signature !== body.signature_key) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  const donationId = body.order_id.replace("DON-", "");

  await updateDonationStatus(donationId, {
    payment_status: body.transaction_status,
    midtrans_id: body.transaction_id,
  });

  if (body.transaction_status === "settlement") {
    await incrementCampaignCollected(
      body.item_details?.[0]?.id,
      Number(body.gross_amount)
    );
  }

  return NextResponse.json({ received: true });
}
