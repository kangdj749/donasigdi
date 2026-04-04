import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import {
  appendDonation,
  getCampaignByIdOrSlug,
} from "@/lib/google-sheet-service";

/* ================= TYPES ================= */

interface Body {
  campaign_id: string;
  donor_name?: string;
  donor_contact?: string;
  amount: number;
  message?: string;
  is_anonymous?: boolean;
  ref_code?: string | null;
  payment_method?: string;
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

/* ================= HELPERS ================= */

function isEmail(val: string): boolean {
  return val.includes("@");
}

function sanitizeName(
  name?: string,
  anonymous?: boolean
): string {
  if (anonymous || !name?.trim()) return "Hamba Allah";
  return name.trim();
}

/* ================= ROUTE ================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    /* ================= VALIDATION ================= */

    if (!body.campaign_id) {
      throw new Error("CAMPAIGN_ID_REQUIRED");
    }

    if (!body.amount || body.amount < 1000) {
      throw new Error("INVALID_AMOUNT");
    }

    /* ================= GET CAMPAIGN ================= */

    const campaign = await getCampaignByIdOrSlug(
      body.campaign_id
    );

    if (!campaign) {
      throw new Error("CAMPAIGN_NOT_FOUND");
    }

    const campaignId = String(campaign.id);
    const organizationId =
      String(campaign.organization_id ?? "");

    /* ================= NORMALIZE ================= */

    const donationId = `DON-${Date.now()}`;
    const amount = Math.floor(body.amount);

    const donorName = sanitizeName(
      body.donor_name,
      body.is_anonymous
    );

    const donorContact = body.donor_contact ?? "";

    const now = new Date().toISOString();

    /* ================= 1️⃣ INSERT (PENDING) ================= */

    await appendDonation({
      id: donationId,
      campaign_id: campaignId,
      organization_id: organizationId,
      affiliate_id: "",

      ref_code: body.ref_code ?? "",

      donor_name: donorName,
      donor_contact: donorContact,

      amount: amount,
      commission_amount: 0,

      payment_status: "pending",

      midtrans_id: "",
      snap_token: "",

      message: body.message ?? "",
      is_anonymous: body.is_anonymous ?? false,

      created_at: now,

      ref: body.ref_code ?? "",

      payment_method: body.payment_method ?? "midtrans",

      fee: 0,
      net_amount: amount,
    });

    /* ================= 2️⃣ CREATE SNAP ================= */

    const payload: SnapPayload = {
      transaction_details: {
        order_id: donationId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: donorName,
        phone: isEmail(donorContact)
          ? undefined
          : donorContact,
        email: isEmail(donorContact)
          ? donorContact
          : undefined,
      },
    };

    const transaction = await (
      snap.createTransaction as unknown as (
        p: SnapPayload
      ) => Promise<{ token: string }>
    )(payload);

    if (!transaction?.token) {
      throw new Error("FAILED_CREATE_TRANSACTION");
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      token: transaction.token,
      donationId,
    });

  } catch (err) {
    console.error("🔥 CREATE DONATION ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create donation",
      },
      { status: 500 }
    );
  }
}