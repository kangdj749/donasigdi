import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  updatePaymentStatus,
  incrementCampaignCollected,
  getDonationById,
} from "@/lib/google-sheet-service";

export const dynamic = "force-dynamic";

type Payload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id: string;
};

function verifySignature(payload: Payload): boolean {
  const raw =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    process.env.MIDTRANS_SERVER_KEY!;

  const hash = crypto.createHash("sha512").update(raw).digest("hex");

  return hash === payload.signature_key;
}

function mapStatus(status: string): string {
  if (status === "settlement" || status === "capture") return "paid";
  if (status === "expire") return "expired";
  if (status === "cancel" || status === "deny") return "failed";
  if (status === "refund" || status === "partial_refund") return "refunded";
  return "pending";
}

export async function POST(req: Request) {
  try {
    const payload: Payload = await req.json();

    // 1️⃣ Verify signature (security layer)
    if (!verifySignature(payload)) {
      console.error("❌ Invalid signature from Midtrans");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const paymentStatus = mapStatus(payload.transaction_status);

    // 2️⃣ Ambil data donation lama
    const donation = await getDonationById(payload.order_id);

    if (!donation) {
      console.error("❌ Donation not found:", payload.order_id);
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    const wasPaid = donation.payment_status === "paid";

    // 3️⃣ Update status donation
    await updatePaymentStatus(payload.order_id, {
      payment_status: paymentStatus,
      midtrans_id: payload.transaction_id,
    });

    // 4️⃣ Increment campaign hanya jika:
    // - Sebelumnya belum paid
    // - Sekarang berubah jadi paid
    if (!wasPaid && paymentStatus === "paid") {
      await incrementCampaignCollected(
        donation.campaign_id,
        Number(payload.gross_amount)
      );

      console.log(
        `✅ Campaign ${donation.campaign_id} increment +${payload.gross_amount}`
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}
