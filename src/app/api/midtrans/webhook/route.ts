import { NextResponse } from "next/server";
import crypto from "crypto";
import { updatePaymentStatus } from "@/lib/google-sheet-service";

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

function mapStatus(status: string) {
  if (status === "settlement" || status === "capture") return "paid";
  if (status === "expire") return "expired";
  if (status === "cancel" || status === "deny") return "failed";
  if (status === "refund" || status === "partial_refund") return "refunded";
  return "pending";
}

export async function POST(req: Request) {
  try {
    const payload: Payload = await req.json();

    if (!verifySignature(payload)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const paymentStatus = mapStatus(payload.transaction_status);

    await updatePaymentStatus(payload.order_id, {
      payment_status: paymentStatus,
      midtrans_id: payload.transaction_id,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
