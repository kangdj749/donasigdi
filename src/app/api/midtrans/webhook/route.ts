import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  updateDonationStatus,
  incrementCampaignStats,
  getDonationRaw,
} from "@/lib/google-sheet-service";

export const dynamic = "force-dynamic";

/* ================= TYPES ================= */

type MidtransPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key?: string;
  transaction_status: string;
  transaction_id: string;
};

/* ================= HELPERS ================= */

function verifySignature(payload: MidtransPayload): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !payload.signature_key) return false;

  const raw =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    serverKey;

  const hash = crypto.createHash("sha512").update(raw).digest("hex");

  return hash === payload.signature_key;
}

function mapStatus(status: string): string {
  if (["capture", "settlement"].includes(status)) return "paid";
  if (status === "pending") return "pending";
  if (["deny", "cancel"].includes(status)) return "failed";
  if (status === "expire") return "expired";
  return "pending";
}

/* ================= HANDLER ================= */

export async function POST(req: Request) {
  try {
    const payload: MidtransPayload = await req.json();

    console.log("📩 WEBHOOK:", payload);

    // 🔥 aktifkan ini di production
    // if (!verifySignature(payload)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    // }

    const donation = await getDonationRaw(payload.order_id);

    if (!donation) {
      console.error("❌ DONATION NOT FOUND:", payload.order_id);
      return NextResponse.json({ received: true });
    }

    const newStatus = mapStatus(payload.transaction_status);
    const wasPaid = donation.payment_status === "paid";

    await updateDonationStatus(payload.order_id, {
      payment_status: newStatus,
      midtrans_id: payload.transaction_id,
    });

    if (wasPaid || newStatus !== "paid") {
      return NextResponse.json({ received: true });
    }

    console.log("💰 PAYMENT SUCCESS:", payload.order_id);

    await incrementCampaignStats(
      String(donation.campaign_id),
      Number(donation.amount || 0)
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}