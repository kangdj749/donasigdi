import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  updateDonationStatus,
  getDonationById,
  incrementCampaignStats,
  appendDonation, // ❌ NOT USED (just safety import optional)
} from "@/lib/google-sheet-service";
import { appendSheetRow } from "@/lib/google-sheet"; // optional keep

export const dynamic = "force-dynamic";

/* ================= TYPES ================= */

type MidtransPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id: string;
};

/* ================= HELPERS ================= */

function verifySignature(payload: MidtransPayload): boolean {
  const raw =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    process.env.MIDTRANS_SERVER_KEY!;

  const hash = crypto.createHash("sha512").update(raw).digest("hex");

  return hash === payload.signature_key;
}

function mapStatus(status: string): string {
  switch (status) {
    case "capture":
    case "settlement":
      return "paid";

    case "pending":
      return "pending";

    case "deny":
    case "cancel":
      return "failed";

    case "expire":
      return "expired";

    case "refund":
    case "partial_refund":
      return "refunded";

    default:
      return "pending";
  }
}

function isAnonymous(val: string | boolean): boolean {
  if (typeof val === "boolean") return val;
  return String(val).toUpperCase() === "TRUE";
}

/* ================= HANDLER ================= */

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as MidtransPayload;

    /* ================= VERIFY ================= */
    if (!verifySignature(payload)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    /* ================= FIND DONATION ================= */
    const donation = await getDonationById(payload.order_id);

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    const newStatus = mapStatus(payload.transaction_status);
    const wasPaid = donation.payment_status === "paid";

    /* ================= UPDATE STATUS ================= */
    await updateDonationStatus(payload.order_id, {
      payment_status: newStatus,
      midtrans_id: payload.transaction_id,
    });

    /* ================= IDPOTENT SAFE ================= */
    if (!wasPaid && newStatus === "paid") {
      /* 🔥 UPDATE CAMPAIGN */
      await incrementCampaignStats(
        donation.campaign_id,
        donation.amount
      );

      console.log(
        `🔥 Campaign ${donation.campaign_id} +${donation.amount}`
      );

      /* ================= AUTO PRAYER ================= */
      if (donation.message?.trim()) {
        await appendSheetRow("prayers!A:G", [
          `PR-${Date.now()}`,
          donation.campaign_id,
          isAnonymous(donation.is_anonymous)
            ? "Hamba Allah"
            : donation.donor_name,
          donation.message,
          0,
          "donation",
          new Date().toISOString(),
        ]);

        console.log(`💚 Prayer created from ${donation.id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}