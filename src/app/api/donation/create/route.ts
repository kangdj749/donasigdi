import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

type CreateDonationBody = {
  campaignId: string;
  campaignTitle: string;
  amount: number;
  name: string;
  email: string;
};

export async function POST(req: Request) {
  const body: CreateDonationBody = await req.json();

  const parameter = {
    transaction_details: {
      order_id: `DON-${Date.now()}`,
      gross_amount: body.amount,
    },
    item_details: [
      {
        id: body.campaignId,
        price: body.amount,
        quantity: 1,
        name: body.campaignTitle,
      },
    ],
    customer_details: {
      first_name: body.name,
      email: body.email,
    },
  } as any; // 🔥 fix type issue

  const transaction = await snap.createTransaction(parameter);

  return NextResponse.json({
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  });
}
