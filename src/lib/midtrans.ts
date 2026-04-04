import midtransClient from "midtrans-client";

/* =========================
   ENV VALIDATION (SAFE)
========================= */

const isProduction =
  process.env.MIDTRANS_IS_PRODUCTION === "true";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey) {
  throw new Error(
    "❌ MIDTRANS_SERVER_KEY is not defined"
  );
}

if (!clientKey) {
  throw new Error(
    "❌ MIDTRANS_CLIENT_KEY is not defined"
  );
}

/* =========================
   SNAP INSTANCE
========================= */

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

/* =========================
   OPTIONAL: CORE API (ADVANCED)
========================= */

export const core = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});