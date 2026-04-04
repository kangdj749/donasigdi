import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { updateSnapToken } from "@/lib/google-sheet-service";
import { snap } from "@/lib/midtrans";

/* ================= TYPES ================= */

interface TokenRequestBody {
  donationId: string;
  donor_name: string;
  donor_contact: string;
  amount: number;
  campaignTitle?: string; // optional biar item name lebih proper
}

/* ================= MIDTRANS CONFIG ================= */



/* ================= HANDLER ================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TokenRequestBody;

    /* ---------- VALIDATION ---------- */
    if (!body.donationId) {
      throw new Error("INVALID_DONATION_ID");
    }

    if (!body.amount || body.amount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    /* ---------- ITEM DETAILS ---------- */
    const item_details = [
      {
        id: body.donationId,
        name: body.campaignTitle
          ? `Donasi - ${body.campaignTitle}`.slice(0, 50)
          : "Donasi Campaign",
        price: Number(body.amount),
        quantity: 1,
      },
    ];

    /* ---------- GROSS AMOUNT ---------- */
    const gross_amount = item_details.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    /* ---------- CUSTOMER DETAILS ---------- */
    const isEmail = body.donor_contact.includes("@");

    const customer_details = {
      first_name: body.donor_name || "Donatur",
      email: isEmail ? body.donor_contact : undefined,
      phone: !isEmail ? body.donor_contact : undefined,
    };

    /* ---------- CREATE TRANSACTION ---------- */
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: body.donationId,
        gross_amount,
      },
      item_details,
      customer_details,
    } as unknown as midtransClient.SnapTransactionParameters);

    if (!transaction?.token) {
      throw new Error("FAILED_CREATE_TRANSACTION");
    }

    /* ---------- SAVE TOKEN TO SHEET ---------- */
    await updateSnapToken(body.donationId, transaction.token);

    return NextResponse.json({ token: transaction.token });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ MIDTRANS TOKEN ERROR:", err.message);
    } else {
      console.error("❌ MIDTRANS TOKEN UNKNOWN ERROR");
    }

    return NextResponse.json(
      { error: "Failed generate token" },
      { status: 500 }
    );
  }
}
