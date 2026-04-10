import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

import { snap } from "@/lib/midtrans";
import {
  appendDonation,
  updateSnapToken,
  getCampaignByIdOrSlug,
} from "@/lib/google-sheet-service";

import { appendPrayerRow } from "@/lib/google-sheet";

/* ================= TYPES ================= */

interface Body {
  campaign_id: string;
  organization_slug?: string;
  campaign_slug?: string;

  donor_name?: string;
  donor_contact?: string;
  amount: number;
  message?: string;
  is_anonymous?: boolean;

  ref_code?: string;
  ref?: string;
  src?: string;

  payment_method?: string;
}

/* ================= HELPERS ================= */

function sanitizeName(name?: string, anonymous?: boolean): string {
  if (anonymous || !name?.trim()) return "Hamba Allah";
  return name.trim();
}

function normalizeAmount(amount: number): number {
  return Math.max(1000, Math.floor(amount));
}

function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/* ================= ROUTE ================= */

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    if (!body.campaign_id) {
      return NextResponse.json({ error: "CAMPAIGN_ID_REQUIRED" }, { status: 400 });
    }

    if (!body.amount || body.amount < 1000) {
      return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
    }

    const campaign = await getCampaignByIdOrSlug(body.campaign_id);

    if (!campaign) {
      return NextResponse.json({ error: "CAMPAIGN_NOT_FOUND" }, { status: 404 });
    }

    const campaignId = String(campaign.id);
    const organizationId = String(campaign.organization_id ?? "");

    const donationId = `DON-${Date.now()}`;
    const amount = normalizeAmount(body.amount);

    const donorName = sanitizeName(body.donor_name, body.is_anonymous);
    const donorContact = body.donor_contact ?? "";

    const now = new Date().toISOString();

    /* ================= INSERT DONATION ================= */

    await appendDonation({
      id: donationId,
      campaign_id: campaignId,
      organization_id: organizationId,

      affiliate_id: "",
      ref_code: body.ref_code ?? "",

      donor_name: donorName,
      donor_contact: donorContact,

      amount,
      commission_amount: 0,

      payment_status: "pending",

      midtrans_id: "",
      snap_token: "",

      message: body.message ?? "",
      is_anonymous: body.is_anonymous ?? false,

      created_at: now,

      ref: body.ref ?? body.ref_code ?? "",
      payment_method: body.payment_method ?? "midtrans",

      fee: 0,
      net_amount: amount,

      organization_slug: body.organization_slug ?? "",
      campaign_slug: body.campaign_slug ?? "",
      src: body.src ?? "direct",
    });

    /* ================= CREATE PRAYER (SOURCE OF TRUTH) ================= */

    if (body.message?.trim()) {
      const prayerRow: string[] = [
        `PR-${Date.now()}`,
        campaignId,
        organizationId,
        String(body.organization_slug ?? ""),
        String(body.campaign_slug ?? ""),
        donorName,
        String(body.message),
        " ",
        "0",
        "0",
        String(body.ref ?? body.ref_code ?? ""),
        String(body.src ?? "direct"),
        new Date().toISOString(),
      ];

      await appendPrayerRow(prayerRow);
    }

    /* ================= CREATE SNAP ================= */

    type SnapPayloadExtended =
      midtransClient.SnapTransactionParameters & {
        customer_details?: {
          first_name?: string;
          phone?: string;
          email?: string;
        };
      };

    const payload: SnapPayloadExtended = {
      transaction_details: {
        order_id: donationId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: donorName,
        phone: isEmail(donorContact) ? undefined : donorContact,
        email: isEmail(donorContact) ? donorContact : undefined,
      },
    };

    const transaction = await snap.createTransaction(payload);

    if (!transaction?.token) {
      throw new Error("FAILED_CREATE_TRANSACTION");
    }

    await updateSnapToken(donationId, transaction.token);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      donationId,
    });
  } catch (err) {
    console.error("🔥 CREATE DONATION ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}