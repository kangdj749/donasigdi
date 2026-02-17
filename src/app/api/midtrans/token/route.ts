import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { updateSnapToken } from "@/lib/google-sheet-service";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

interface Body {
  donationId: string;
  donor_name: string;
  donor_contact: string;
  amount: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body.donationId) {
      throw new Error("INVALID_ID");
    }

    if (!body.amount || body.amount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    const parameter = {
      transaction_details: {
        order_id: body.donationId,
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

    const transaction = await snap.createTransaction(parameter);

    if (!transaction?.token) {
      throw new Error("FAILED_CREATE_TRANSACTION");
    }

    await updateSnapToken(body.donationId, transaction.token);

    return NextResponse.json({ token: transaction.token });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("MIDTRANS TOKEN ERROR:", err.message);
    } else {
      console.error("MIDTRANS TOKEN UNKNOWN ERROR");
    }

    return NextResponse.json(
      { error: "Failed generate token" },
      { status: 500 }
    );
  }
}
