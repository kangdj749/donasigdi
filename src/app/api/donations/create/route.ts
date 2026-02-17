import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { appendDonation, updateSnapToken } from "@/lib/google-sheet-service";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

interface Body {
  campaign_id: string;
  donor_name: string;
  donor_contact: string;
  amount: number;
  message?: string;
  is_anonymous?: boolean;
  ref?: string | null;
}

interface SnapPayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    phone?: string;
    email?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body.campaign_id) {
      throw new Error("INVALID_CAMPAIGN");
    }

    if (!body.amount || body.amount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    // ✅ Generate donationId di backend
    const donationId = `DON-${Date.now()}`;

    /* =========================
       1️⃣ SIMPAN KE SHEET
    ========================== */

    await appendDonation({
      id: donationId,
      campaign_id: body.campaign_id,
      donor_name: body.donor_name,
      donor_contact: body.donor_contact,
      amount: Number(body.amount),
      message: body.message ?? "",
      is_anonymous: body.is_anonymous ?? false,
      ref: body.ref ?? "",
      payment_status: "pending",
      snap_token: "",
      midtrans_id: "",
    });

    /* =========================
       2️⃣ CREATE SNAP TOKEN
    ========================== */

    const payload: SnapPayload = {
      transaction_details: {
        order_id: donationId,
        gross_amount: Number(body.amount),
      },
      customer_details: {
        first_name: body.donor_name,
        phone: body.donor_contact.includes("@")
          ? undefined
          : body.donor_contact,
        email: body.donor_contact.includes("@")
          ? body.donor_contact
          : undefined,
      },
    };

    const transaction = await (snap.createTransaction as unknown as (
      p: SnapPayload
    ) => Promise<{ token: string }>)(payload);

    if (!transaction?.token) {
      throw new Error("FAILED_CREATE_TRANSACTION");
    }

    /* =========================
       3️⃣ UPDATE SNAP TOKEN
    ========================== */

    await updateSnapToken(donationId, transaction.token);

    return NextResponse.json({
      token: transaction.token,
      donationId,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("CREATE DONATION ERROR:", err.message);
    } else {
      console.error("UNKNOWN CREATE DONATION ERROR");
    }

    return NextResponse.json(
      { error: "Failed create donation" },
      { status: 500 }
    );
  }
}
